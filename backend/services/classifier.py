"""
Intent classifier service using Groq LLM.
8 Apple Support intents: device_issue, account_access, app_crash,
billing_payment, warranty_repair, setup_activation, network_connectivity, other_general
"""
import json
import time
from groq import Groq
from database import settings

INTENTS = {
    "device_issue": "Hardware problems, device not turning on, physical damage, screen issues, battery problems",
    "account_access": "Apple ID, iCloud, password reset, two-factor authentication, sign-in problems",
    "app_crash": "App Store issues, apps crashing, apps not loading, app updates failing",
    "billing_payment": "Unexpected charges, subscription issues, App Store purchase disputes, refunds",
    "warranty_repair": "AppleCare, warranty claims, repair requests, device replacement, Genius Bar",
    "setup_activation": "New device setup, iOS upgrade, migration, activation lock, restore from backup",
    "network_connectivity": "Wi-Fi not working, Bluetooth issues, cellular data problems, AirDrop",
    "other_general": "General questions, feedback, or issues not fitting other categories",
}

SYSTEM_PROMPT = """You are an Apple Support intent classifier. 
Given a customer's message, classify it into exactly ONE of these intents:

{intent_list}

Respond with valid JSON only:
{{
  "intent": "<intent_key>",
  "confidence": <0.0-1.0 float>,
  "reasoning": "<one sentence explanation>"
}}"""

INTENT_PATTERNS = {
    "device_issue": [
        "battery", "drain", "draining", "screen", "black screen", "touch", "unresponsive",
        "won't turn on", "wont turn on", "shut off", "power", "charge", "charging", "charger",
        "overheat", "hot", "speaker", "sound", "microphone", "mic", "audio", "airpod", "hardware", "camera"
    ],
    "account_access": [
        "apple id", "icloud", "password", "passcode", "locked", "disabled", "sign in", "login",
        "two-factor", "2fa", "verification code", "security question", "unlock", "forgot password", "recovery"
    ],
    "app_crash": [
        "crash", "crashing", "crashes", "app store", "apps", "freezing",
        "force close", "quit unexpectedly", "wont open", "won't open", "stuck on loading"
    ],
    "billing_payment": [
        "charged", "charge", "charges", "billing", "bill", "subscription", "refund", "receipt",
        "apple pay", "payment", "purchase", "money", "bank", "card", "unauthorized", "deducted"
    ],
    "warranty_repair": [
        "applecare", "apple care", "warranty", "genius bar", "repair", "replace", "replacement",
        "appointment", "fix screen", "service center", "store visit"
    ],
    "setup_activation": [
        "update", "updating", "updated", "ios", "install", "installation", "restore", "restoring",
        "backup", "dfu", "recovery mode", "setup", "activation lock", "transfer", "migrate"
    ],
    "network_connectivity": [
        "wifi", "wi-fi", "bluetooth", "cellular", "no service", "searching", "lte", "5g",
        "airdrop", "hotspot", "connection", "disconnected", "call drop", "carrier", "sim", "signal"
    ]
}


def classify_intent_heuristic(message: str) -> dict:
    """Fast, accurate rule-based classification based on Apple domain keywords."""
    msg = message.lower()
    scores = {intent: 0 for intent in INTENTS if intent != "other_general"}
    matched_words = {intent: [] for intent in INTENTS if intent != "other_general"}

    for intent, keywords in INTENT_PATTERNS.items():
        for kw in keywords:
            if kw in msg:
                # Give higher weight to multi-word phrases
                weight = 2 if " " in kw else 1
                scores[intent] += weight
                matched_words[intent].append(kw)

    best_intent = max(scores, key=scores.get)
    best_score = scores[best_intent]

    if best_score > 0:
        confidence = min(0.96, 0.78 + (best_score * 0.05))
        kw_str = ", ".join(list(set(matched_words[best_intent]))[:3])
        return {
            "intent": best_intent,
            "confidence": round(confidence, 2),
            "reasoning": f"Identified {best_intent.replace('_', ' ')} context from patterns: {kw_str}"
        }

    return {
        "intent": "other_general",
        "confidence": 0.72,
        "reasoning": "General inquiry without distinct category keywords."
    }


def classify_intent(message: str, history: list[dict] | None = None) -> dict:
    """Classify a customer message into one of the Apple Support intents."""
    # If Groq is not configured or fails, use high-precision heuristic
    if not settings.GROQ_API_KEY:
        return classify_intent_heuristic(message)

    client = Groq(api_key=settings.GROQ_API_KEY)

    intent_list = "\n".join([f"- {k}: {v}" for k, v in INTENTS.items()])

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT.format(intent_list=intent_list)},
    ]

    if history:
        for msg in history[-4:]:  # last 4 turns for context
            messages.append({
                "role": "user" if msg.get("author_type") == "customer" else "assistant",
                "content": msg.get("text", "")
            })

    messages.append({"role": "user", "content": f"Customer message: {message}"})

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.1,
            max_tokens=256,
        )
        raw = response.choices[0].message.content.strip()
        # Parse JSON — strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())
        # Validate intent key
        if result.get("intent") not in INTENTS:
            result["intent"] = "other_general"
        return result
    except Exception:
        # Graceful fallback to heuristic
        return classify_intent_heuristic(message)


def estimate_sentiment(message: str) -> float:
    """
    Returns sentiment score: -1.0 (very negative) to 1.0 (very positive).
    Uses simple keyword heuristic (avoids extra API calls for demo).
    """
    negative_keywords = [
        "angry", "furious", "terrible", "awful", "worst", "hate", "useless",
        "broken", "fraud", "scam", "lawsuit", "stolen", "ruined", "unacceptable",
        "disgusting", "pathetic", "incompetent", "lied", "cheated", "ripped off"
    ]
    positive_keywords = [
        "thanks", "great", "love", "perfect", "excellent", "awesome", "happy",
        "solved", "fixed", "working", "appreciate", "helpful", "wonderful"
    ]
    message_lower = message.lower()
    neg = sum(1 for w in negative_keywords if w in message_lower)
    pos = sum(1 for w in positive_keywords if w in message_lower)
    total = neg + pos
    if total == 0:
        return 0.0
    return round((pos - neg) / total, 2)
