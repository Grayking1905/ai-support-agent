"""Agent router — classify, reply, escalate."""
import time, uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Conversation, Tweet, IntentEnum, EscalationEnum
from schemas import AgentProcessRequest, AgentProcessResponse, IntentClassification, EscalationDecision
from services.classifier import classify_intent, estimate_sentiment
from services.rag_service import search_similar
from services.reply_generator import generate_reply
from services.escalation import decide_escalation
from datetime import datetime

router = APIRouter(prefix="/api/agent", tags=["Agent"])


@router.post("/process", response_model=AgentProcessResponse)
def process_message(req: AgentProcessRequest, db: Session = Depends(get_db)):
    start = time.time()

    # 1. Classify intent
    history = [{"author_type": m.author_type, "text": m.text} for m in (req.conversation_history or [])]
    classification = classify_intent(req.message, history)
    intent = classification.get("intent", "other_general")
    confidence = classification.get("confidence", 0.0)
    reasoning = classification.get("reasoning", "")

    # 2. Sentiment
    sentiment = estimate_sentiment(req.message)

    # 3. RAG search
    rag_results = search_similar(req.message, top_k=5, intent_filter=intent)

    # 4. Generate reply
    reply = generate_reply(req.message, intent, rag_results, req.customer_handle)

    # 5. Escalation decision
    escalation = decide_escalation(req.message, intent, confidence, sentiment)

    # 6. Persist to DB
    conv_id = f"conv_{uuid.uuid4().hex[:12]}"
    esc_status = EscalationEnum.escalated if escalation["decision"] == "escalated" else EscalationEnum.auto_handled
    try:
        intent_enum = IntentEnum(intent)
    except Exception:
        intent_enum = IntentEnum.other_general

    conv = Conversation(
        id=conv_id,
        customer_handle=req.customer_handle,
        customer_name=req.customer_name,
        original_message=req.message,
        intent=intent_enum,
        intent_confidence=confidence,
        escalation_status=esc_status,
        escalation_reason=escalation["reason"],
        sentiment_score=sentiment,
        drafted_reply=reply,
        rag_sources_count=len([r for r in rag_results if r["score"] > 0.4]),
        created_at=datetime.utcnow(),
    )
    db.add(conv)
    db.add(Tweet(
        id=f"tw_{uuid.uuid4().hex[:10]}",
        conversation_id=conv_id,
        author_type="customer",
        text=req.message,
    ))
    db.commit()

    elapsed_ms = int((time.time() - start) * 1000)

    return AgentProcessResponse(
        conversation_id=conv_id,
        classification=IntentClassification(intent=intent, confidence=confidence, reasoning=reasoning),
        drafted_reply=reply,
        escalation=EscalationDecision(decision=escalation["decision"], reason=escalation["reason"], priority=escalation["priority"]),
        rag_sources_used=conv.rag_sources_count,
        sentiment_score=sentiment,
        processing_time_ms=elapsed_ms,
    )
