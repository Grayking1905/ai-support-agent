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

def classify_intent(message: str, history: list[dict] | None = None) -> dict:
    """Classify a customer message into one of the Apple Support intents."""
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
    except Exception as e:
        return {
            "intent": "other_general",
            "confidence": 0.0,
            "reasoning": f"Classification failed: {str(e)}"
        }


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
