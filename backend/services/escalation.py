"""
Escalation decision engine.
Determines whether a message should be auto-handled or escalated to a human.
"""

ESCALATION_KEYWORDS = [
    "lawyer", "lawsuit", "attorney", "legal action", "sue", "court",
    "data breach", "hacked", "identity theft", "fraud", "scam",
    "refund denied", "refused", "discrimination", "threatening",
    "media", "press", "journalist", "report you",
]

SENSITIVE_INTENTS = {"billing_payment", "warranty_repair"}

def decide_escalation(
    message: str,
    intent: str,
    confidence: float,
    sentiment_score: float,
    prior_unresolved_count: int = 0,
) -> dict:
    """
    Returns escalation decision dict:
    {
        "decision": "auto_handled" | "escalated",
        "reason": str,
        "priority": "low" | "medium" | "high" | "urgent"
    }
    """
    message_lower = message.lower()

    # Rule 1: Legal / sensitive keywords → urgent escalation
    for kw in ESCALATION_KEYWORDS:
        if kw in message_lower:
            return {
                "decision": "escalated",
                "reason": f"Sensitive/legal content detected: '{kw}'",
                "priority": "urgent",
            }

    # Rule 2: Very negative sentiment
    if sentiment_score <= -0.6:
        return {
            "decision": "escalated",
            "reason": "High negative sentiment — customer appears very frustrated",
            "priority": "high",
        }

    # Rule 3: Low confidence classification
    if confidence < 0.65:
        return {
            "decision": "escalated",
            "reason": f"Low classification confidence ({confidence:.0%}) — ambiguous intent",
            "priority": "medium",
        }

    # Rule 4: Repeat unresolved customer
    if prior_unresolved_count >= 3:
        return {
            "decision": "escalated",
            "reason": f"Customer has {prior_unresolved_count} unresolved prior interactions",
            "priority": "high",
        }

    # Rule 5: Sensitive intent + negative sentiment
    if intent in SENSITIVE_INTENTS and sentiment_score < -0.3:
        return {
            "decision": "escalated",
            "reason": f"Sensitive intent ({intent}) with negative sentiment",
            "priority": "medium",
        }

    # Default: auto-handle
    priority = "low"
    if sentiment_score < 0:
        priority = "medium"

    return {
        "decision": "auto_handled",
        "reason": "Classified with sufficient confidence, no escalation triggers detected",
        "priority": priority,
    }
