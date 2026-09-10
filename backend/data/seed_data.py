# -*- coding: utf-8 -*-
"""
Seed data generator -- creates realistic mock Apple Support conversations
and upserts them into Qdrant + PostgreSQL for demo purposes.
"""
import sys, os, uuid, random
sys.stdout.reconfigure(encoding='utf-8')  # fix Windows cp1252
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import SessionLocal, engine
from models import Base, Conversation, Tweet, IntentEnum, EscalationEnum
from services.rag_service import upsert_conversation

Base.metadata.create_all(bind=engine)

SEED_CONVERSATIONS = [
    {
        "intent": "device_issue",
        "customer": "@mike_tech",
        "message": "My iPhone 15 Pro won't turn on after updating to iOS 17.4. I've tried holding the power button for 30 seconds. Completely dead screen!",
        "reply": "We're sorry to hear your iPhone isn't responding after the update. Please try a force restart: press and quickly release Volume Up, then Volume Down, then hold the Side button until you see the Apple logo. If that doesn't work, DM us your serial number. ^AS",
        "sentiment": -0.5,
        "confidence": 0.92,
        "escalation": "auto_handled",
    },
    {
        "intent": "account_access",
        "customer": "@sarah_jones92",
        "message": "I can't log into my Apple ID. I've reset my password 3 times and it keeps saying my account is locked. I have 2FA enabled but the code never comes through.",
        "reply": "We understand how frustrating being locked out can be. Let's get you back in. Please go to iforgot.apple.com and try account recovery. If you're not receiving 2FA codes, ensure your trusted phone number is current. DM us for further help. ^AS",
        "sentiment": -0.4,
        "confidence": 0.95,
        "escalation": "auto_handled",
    },
    {
        "intent": "app_crash",
        "customer": "@devraj_patel",
        "message": "The App Store keeps crashing every time I try to download anything. Other apps work fine. This started after I updated to iOS 17.3.",
        "reply": "Let's fix that for you! Try these steps: 1) Sign out of the App Store (Settings > [your name] > Media & Purchases > Sign Out), then sign back in. 2) Go to Settings > General > iPhone Storage and offload the App Store. Let us know if this helps! ^AS",
        "sentiment": -0.2,
        "confidence": 0.88,
        "escalation": "auto_handled",
    },
    {
        "intent": "billing_payment",
        "customer": "@frustrated_mom",
        "message": "My 8-year-old made $340 in in-app purchases without my permission! I need a refund immediately. This is unacceptable and I'm extremely upset.",
        "reply": "We completely understand your concern and we're here to help. Please visit reportaproblem.apple.com to request a refund for unauthorized purchases. If you haven't already, enable Ask to Buy in Family Sharing to prevent future purchases. DM us if you need more help. ^AS",
        "sentiment": -0.8,
        "confidence": 0.91,
        "escalation": "escalated",
    },
    {
        "intent": "warranty_repair",
        "customer": "@james_r_wilson",
        "message": "My MacBook Pro screen has dead pixels and it's only 6 months old. Is this covered under warranty? I have AppleCare+",
        "reply": "Dead pixels on a 6-month-old MacBook with AppleCare+ are absolutely covered. Please schedule an appointment at your nearest Apple Store or Apple Authorized Service Provider at apple.com/retail. You can also start a repair at getsupport.apple.com. ^AS",
        "sentiment": -0.1,
        "confidence": 0.94,
        "escalation": "auto_handled",
    },
    {
        "intent": "setup_activation",
        "customer": "@new_iphone_user",
        "message": "Just got my new iPhone 16! But when I try to transfer from my old iPhone using Quick Start, it gets stuck at 'Transferring Data' for hours. What should I do?",
        "reply": "Congrats on your new iPhone 16! Quick Start transfers can take a while with lots of data. Make sure both phones are plugged in, on Wi-Fi, and close to each other. If it's stuck for more than 3 hours, try restarting both devices and using iCloud backup instead at Settings > [your name] > iCloud. ^AS",
        "sentiment": 0.3,
        "confidence": 0.89,
        "escalation": "auto_handled",
    },
    {
        "intent": "network_connectivity",
        "customer": "@wifi_troubles",
        "message": "My iPad Pro won't connect to 5GHz WiFi after updating iPadOS. It connects to 2.4GHz but that's so slow. My other devices work fine on 5GHz.",
        "reply": "That sounds frustrating! Please try: 1) Forget the 5GHz network (Settings > Wi-Fi > tap the network > Forget), then reconnect. 2) Reset network settings (Settings > General > Transfer or Reset > Reset > Reset Network Settings). This clears all saved networks so note your passwords first. ^AS",
        "sentiment": -0.2,
        "confidence": 0.87,
        "escalation": "auto_handled",
    },
    {
        "intent": "device_issue",
        "customer": "@battery_drain",
        "message": "My iPhone 14 battery is draining super fast. Goes from 100% to 20% in 3 hours. I barely use it! Battery health shows 89% so it should be fine.",
        "reply": "Abnormal battery drain can be caused by background app activity. Check Settings > Battery to see which apps are consuming the most power. Also try: turning off Background App Refresh for heavy apps, reducing screen brightness, and ensuring iOS is up to date. ^AS",
        "sentiment": -0.3,
        "confidence": 0.90,
        "escalation": "auto_handled",
    },
    {
        "intent": "account_access",
        "customer": "@activation_lock",
        "message": "I bought a used iPhone and it's asking for the previous owner's Apple ID. The seller isn't responding to my messages. I'm stuck with a useless phone!",
        "reply": "We understand this is a difficult situation. Unfortunately, for security reasons, we can only remove Activation Lock with the original owner's Apple ID credentials or proof of purchase. We recommend contacting the seller or the platform you purchased from. Visit support.apple.com/activation-lock for more info. ^AS",
        "sentiment": -0.6,
        "confidence": 0.93,
        "escalation": "auto_handled",
    },
    {
        "intent": "billing_payment",
        "customer": "@icloud_charge",
        "message": "Why was I charged $2.99 for iCloud storage? I thought the 5GB was free. I never signed up for extra storage.",
        "reply": "The 5GB iCloud storage is free, but it looks like an upgrade may have been added. To check and cancel: go to Settings > [your name] > iCloud > Manage Account Storage > Change Storage Plan. If you see a paid plan you didn't add, you can downgrade to free there. ^AS",
        "sentiment": -0.2,
        "confidence": 0.91,
        "escalation": "auto_handled",
    },
    {
        "intent": "app_crash",
        "customer": "@facetime_broken",
        "message": "FaceTime keeps dropping after exactly 2 minutes every single call. This is really affecting my work video calls. Please fix this.",
        "reply": "Consistent 2-minute FaceTime drops often point to a network or router timeout setting. Try: 1) Switch to cellular data to test. 2) On your router, disable 'SIP ALG' setting if available. 3) Go to Settings > FaceTime, toggle it off and back on. Let us know the results! ^AS",
        "sentiment": -0.3,
        "confidence": 0.86,
        "escalation": "auto_handled",
    },
    {
        "intent": "warranty_repair",
        "customer": "@cracked_screen",
        "message": "I dropped my iPhone 15 and the screen cracked. I have AppleCare+. How much will the screen repair cost?",
        "reply": "With AppleCare+, an accidental damage screen repair has a service fee of $29 for iPhone. You can start a repair at getsupport.apple.com, visit an Apple Store, or use our mail-in service. Availability may vary by location. ^AS",
        "sentiment": -0.1,
        "confidence": 0.95,
        "escalation": "auto_handled",
    },
    {
        "intent": "network_connectivity",
        "customer": "@bluetooth_fail",
        "message": "My AirPods Pro keep disconnecting from my iPhone 15. They were working fine before. Now they disconnect every few minutes.",
        "reply": "Let's reconnect your AirPods properly! Try: 1) Put AirPods in case, open lid near iPhone, press and hold the setup button on case until light flashes white, then reconnect. 2) Forget the device in Bluetooth settings and re-pair. Also ensure firmware is updated. ^AS",
        "sentiment": -0.2,
        "confidence": 0.88,
        "escalation": "auto_handled",
    },
    {
        "intent": "setup_activation",
        "customer": "@restore_help",
        "message": "I accidentally factory reset my iPhone without backing up. Is there any way to recover my photos and messages? I'm devastated.",
        "reply": "We know how distressing data loss can be. If you had iCloud Backup enabled, your data may still be recoverable — restore from iCloud during iPhone setup. Also check if photos were in iCloud Photos (icloud.com). Unfortunately, without a backup, local data cannot be recovered after a reset. ^AS",
        "sentiment": -0.7,
        "confidence": 0.91,
        "escalation": "auto_handled",
    },
    {
        "intent": "device_issue",
        "customer": "@overheating_mac",
        "message": "My MacBook Air M3 gets extremely hot even when doing basic tasks like browsing. The fan doesn't even turn on (no fan) but it throttles badly.",
        "reply": "M-series MacBooks use passive cooling which is normal, but thermal throttling during light tasks isn't expected. Try: 1) Check Activity Monitor for runaway processes. 2) Reset SMC isn't applicable for M-series, but shutting down for 30 sec helps. 3) Ensure vents aren't blocked. DM us if it persists. ^AS",
        "sentiment": -0.3,
        "confidence": 0.89,
        "escalation": "auto_handled",
    },
]


def run_seed():
    db = SessionLocal()
    try:
        # Clear existing seed data
        db.query(Tweet).delete()
        db.query(Conversation).delete()
        db.commit()

        base_time = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=7)

        for i, seed in enumerate(SEED_CONVERSATIONS):
            conv_id = f"conv_{uuid.uuid4().hex[:12]}"
            created_at = base_time + timedelta(hours=i * 11, minutes=random.randint(0, 59))

            # Determine intent and escalation enums
            intent_val = IntentEnum(seed["intent"])
            esc_val = EscalationEnum(seed["escalation"])

            escalation_reason = None
            if esc_val == EscalationEnum.escalated:
                escalation_reason = "High negative sentiment — customer appears very frustrated"

            conv = Conversation(
                id=conv_id,
                customer_handle=seed["customer"],
                customer_name=seed["customer"].strip("@").replace("_", " ").title(),
                original_message=seed["message"],
                created_at=created_at,
                intent=intent_val,
                intent_confidence=seed["confidence"],
                escalation_status=esc_val,
                escalation_reason=escalation_reason,
                sentiment_score=seed["sentiment"],
                drafted_reply=seed["reply"],
                rag_sources_count=random.randint(2, 5),
                is_resolved=random.random() > 0.3,
                resolved_at=created_at + timedelta(hours=random.randint(1, 8)) if random.random() > 0.3 else None,
            )
            db.add(conv)

            # Add customer tweet
            db.add(Tweet(
                id=f"tw_{uuid.uuid4().hex[:10]}",
                conversation_id=conv_id,
                author_type="customer",
                text=seed["message"],
                tweet_at=created_at,
            ))

            # Add Apple support reply
            db.add(Tweet(
                id=f"tw_{uuid.uuid4().hex[:10]}",
                conversation_id=conv_id,
                author_type="apple_support",
                text=seed["reply"],
                tweet_at=created_at + timedelta(minutes=random.randint(5, 45)),
            ))

            # Upsert into Qdrant
            try:
                upsert_conversation(
                    doc_id=conv_id,
                    text=seed["message"],
                    intent=seed["intent"],
                    source_handle=seed["customer"],
                    reply=seed["reply"],
                )
                print(f"[OK] Seeded [{seed['intent']}] {seed['customer']}")
            except Exception as e:
                print(f"[WARN] Qdrant upsert skipped for {conv_id}: {e}")

        db.commit()
        print(f"\n[DONE] Seeded {len(SEED_CONVERSATIONS)} conversations into PostgreSQL & Qdrant.")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
