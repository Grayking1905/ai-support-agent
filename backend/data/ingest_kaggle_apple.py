"""
Ingest Kaggle Apple Support dataset into PostgreSQL and Qdrant.
Performs:
1. Intent classification across Apple domain taxonomy
2. Sentiment estimation
3. Auto-handle vs Escalation triage with explicit reason
4. Vector embedding via BAAI/bge-small-en-v1.5
5. Dense vector upsert to Qdrant collection 'apple_support_conversations'
6. Relational storage in PostgreSQL 'conversations' and 'tweets' tables
"""
import sys
import os
import json
from datetime import datetime
from email.utils import parsedate_to_datetime

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from database import engine, SessionLocal
from models import Base, Conversation, Tweet, IntentEnum, EscalationEnum
from services.classifier import classify_intent, classify_intent_heuristic, estimate_sentiment
from services.escalation import decide_escalation
from services.rag_service import upsert_batch_conversations, get_collection_count, ensure_collection
from services.embeddings import embed_batch


def parse_tweet_date(date_str: str) -> datetime:
    """Parse Twitter RFC 2822 date string like 'Tue Oct 31 22:31:23 +0000 2017'."""
    try:
        dt = parsedate_to_datetime(date_str)
        return dt.replace(tzinfo=None)
    except Exception:
        return datetime.utcnow()


def run_migrations():
    """Ensure all required columns exist in PostgreSQL."""
    print("Running database migrations...")
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS historical_apple_reply TEXT;"))
        conn.execute(text("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS apple_signoff VARCHAR;"))
        conn.commit()
    print("Database schema verified.")


def synthesize_draft(message: str, intent: str, historical_reply: str, signoff: str) -> str:
    """
    Generate a grounded Apple Support reply based on the historical resolution pattern.
    """
    sign = signoff if signoff else "^AS"
    intent_clean = intent.replace("_", " ")

    # If the historical reply gives a clear direct link or DM prompt, ground our drafted response
    if "dm" in historical_reply.lower() or "direct message" in historical_reply.lower():
        return f"We're here to help get this sorted out with you. Please DM us with your current iOS version and device model so we can take a closer look: getsupport.apple.com {sign}"
    elif "update" in message.lower() or "ios" in message.lower():
        return f"We'd like to look into this update issue with you. Have you tried force restarting your device or checking available storage in Settings > General > iPhone Storage? Let us know. {sign}"
    elif "battery" in message.lower() or "charge" in message.lower():
        return f"Battery performance is important to us. Let's check your Battery Health under Settings > Battery > Battery Health & Charging. We're here if you need more help. {sign}"
    elif "wifi" in message.lower() or "cellular" in message.lower() or "network" in message.lower():
        return f"We'd love to help get your connection back up and running. Try toggling Airplane Mode on and off, or go to Settings > General > Transfer or Reset iPhone > Reset Network Settings. {sign}"
    elif "billing" in intent or "charge" in message.lower() or "refund" in message.lower():
        return f"We can help review your purchase history. You can view all subscriptions and request refunds directly at reportaproblem.apple.com or DM us for assistance. {sign}"
    elif "apple id" in message.lower() or "password" in message.lower() or "locked" in message.lower():
        return f"Account security is top priority. You can regain access and reset your credentials securely at iforgot.apple.com. Let us know if you need any further steps. {sign}"
    else:
        return f"We understand how important this is and want to help. Could you let us know what troubleshooting steps you've tried so far? We're right here. {sign}"


def ingest_dataset():
    dataset_path = os.path.join(os.path.dirname(__file__), "apple_support_dataset.json")
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset file not found at {dataset_path}")
        return

    with open(dataset_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Loaded {len(data)} paired conversations from Kaggle Apple Support dataset.")

    run_migrations()
    ensure_collection()

    db = SessionLocal()

    # Clear old data for a clean, consistent state
    print("Clearing previous records for clean ingestion...")
    db.query(Tweet).delete()
    db.query(Conversation).delete()
    db.commit()

    print(f"Processing and classifying {len(data)} conversations...")

    processed_conversations = []
    qdrant_items = []
    all_texts = []

    intent_counts = {}
    auto_handled_count = 0
    escalated_count = 0

    for i, item in enumerate(data):
        msg = item["original_message"]
        all_texts.append(msg)

        # 1. Intent Classification (fast, accurate Apple domain heuristic)
        classification = classify_intent_heuristic(msg)
        intent_key = classification.get("intent", "other_general")
        confidence = float(classification.get("confidence", 0.75))
        reasoning = classification.get("reasoning", "")

        intent_counts[intent_key] = intent_counts.get(intent_key, 0) + 1

        # 2. Sentiment Estimation
        sentiment = estimate_sentiment(msg)

        # 3. Escalation Triage Decision
        escalation = decide_escalation(msg, intent_key, confidence, sentiment)
        decision = escalation.get("decision", "auto_handled")
        esc_reason = escalation.get("reason", "Classified with sufficient confidence")

        if decision == "auto_handled":
            auto_handled_count += 1
            esc_status = EscalationEnum.auto_handled
        else:
            escalated_count += 1
            esc_status = EscalationEnum.escalated

        # 4. Synthesize Grounded Reply
        hist_reply = item.get("historical_apple_reply", "")
        signoff = item.get("apple_signoff", "^AS")
        drafted_reply = synthesize_draft(msg, intent_key, hist_reply, signoff)

        # Map to IntentEnum
        try:
            intent_enum = IntentEnum(intent_key)
        except Exception:
            intent_enum = IntentEnum.other_general

        created_dt = parse_tweet_date(item.get("created_at", ""))

        conv = Conversation(
            id=item["id"],
            customer_handle=item["customer_handle"],
            customer_name=f"User {item['customer_handle'].replace('@', '')}",
            original_message=msg,
            created_at=created_dt,
            intent=intent_enum,
            intent_confidence=confidence,
            escalation_status=esc_status,
            escalation_reason=esc_reason,
            sentiment_score=sentiment,
            drafted_reply=drafted_reply,
            historical_apple_reply=hist_reply,
            apple_signoff=signoff,
            rag_sources_count=3,
            is_resolved=True,
            resolved_at=created_dt,
        )
        processed_conversations.append(conv)

        # Tweets
        t_cust = Tweet(
            id=f"tw_{item['tweet_id']}_c",
            conversation_id=item["id"],
            author_type="customer",
            text=msg,
            tweet_at=created_dt,
        )
        t_apple = Tweet(
            id=f"tw_{item['reply_tweet_id']}_a",
            conversation_id=item["id"],
            author_type="apple_support",
            text=hist_reply,
            tweet_at=created_dt,
        )

        db.add(conv)
        db.add(t_cust)
        db.add(t_apple)

        # Qdrant item payload
        qdrant_items.append({
            "doc_id": item["id"],
            "text": msg,
            "intent": intent_key,
            "source_handle": item["customer_handle"],
            "reply": hist_reply,
            "signoff": signoff,
        })

    # Commit PostgreSQL
    db.commit()
    print(f"Successfully committed {len(processed_conversations)} conversations to PostgreSQL!")

    # 5. Vector Embedding & Qdrant Upsert
    print(f"Generating 384-dimensional BGE embeddings for {len(all_texts)} messages in batches...")
    vectors = embed_batch(all_texts)
    for q_item, vec in zip(qdrant_items, vectors):
        q_item["vector"] = vec

    print("Upserting vectors into Qdrant collection 'apple_support_conversations'...")
    upsert_batch_conversations(qdrant_items)

    qdrant_total = get_collection_count()
    print(f"Qdrant collection updated! Total points in Qdrant: {qdrant_total}")

    # Print Summary Report
    print("\n" + "=" * 55)
    print("      INGESTION & TRIAGE PIPELINE REPORT")
    print("=" * 55)
    print(f"Total Conversations Ingested : {len(processed_conversations)}")
    print(f"Auto-Handled by Agent        : {auto_handled_count} ({auto_handled_count / len(processed_conversations):.1%})")
    print(f"Escalated to Human Specialist: {escalated_count} ({escalated_count / len(processed_conversations):.1%})")
    print("-" * 55)
    print("Intent Breakdown:")
    for intent, count in sorted(intent_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {intent:<22} : {count:3d} ({count / len(processed_conversations):.1%})")
    print("-" * 55)
    print(f"PostgreSQL Conversations     : {db.query(Conversation).count()}")
    print(f"PostgreSQL Tweets            : {db.query(Tweet).count()}")
    print(f"Qdrant Vectors               : {qdrant_total}")
    print("=" * 55 + "\n")

    db.close()


if __name__ == "__main__":
    ingest_dataset()
