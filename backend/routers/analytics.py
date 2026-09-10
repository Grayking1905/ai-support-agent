"""Analytics router — metrics for dashboard."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Conversation, EscalationEnum
from schemas import AnalyticsSummary, IntentDistributionItem

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

INTENT_LABELS = {
    "device_issue": "Device Issue",
    "account_access": "Account Access",
    "app_crash": "App / Software",
    "billing_payment": "Billing & Payment",
    "warranty_repair": "Warranty & Repair",
    "setup_activation": "Setup & Activation",
    "network_connectivity": "Network & Connectivity",
    "other_general": "Other / General",
}


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(db: Session = Depends(get_db)):
    total = db.query(Conversation).count()
    auto = db.query(Conversation).filter(Conversation.escalation_status == EscalationEnum.auto_handled).count()
    escalated = db.query(Conversation).filter(Conversation.escalation_status == EscalationEnum.escalated).count()
    resolved = db.query(Conversation).filter(Conversation.is_resolved == True).count()
    avg_conf = db.query(func.avg(Conversation.intent_confidence)).scalar() or 0.0

    # Intent distribution
    intent_counts = (
        db.query(Conversation.intent, func.count(Conversation.id))
        .group_by(Conversation.intent)
        .all()
    )
    intent_dist = []
    for intent, count in intent_counts:
        if intent:
            pct = round((count / total * 100) if total > 0 else 0, 1)
            intent_dist.append(IntentDistributionItem(
                intent=str(intent.value if hasattr(intent, 'value') else intent),
                count=count,
                percentage=pct,
                label=INTENT_LABELS.get(str(intent.value if hasattr(intent, 'value') else intent), str(intent)),
            ))

    return AnalyticsSummary(
        total_conversations=total,
        auto_handled=auto,
        escalated=escalated,
        resolved=resolved,
        avg_confidence=round(float(avg_conf), 3),
        intent_distribution=sorted(intent_dist, key=lambda x: x.count, reverse=True),
    )


@router.get("/trend")
def get_trend(db: Session = Depends(get_db)):
    """Return last 7 days volume for charting."""
    from datetime import datetime, timedelta
    days = []
    for i in range(6, -1, -1):
        day = datetime.utcnow() - timedelta(days=i)
        start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        end = day.replace(hour=23, minute=59, second=59)
        count = db.query(Conversation).filter(
            Conversation.created_at >= start,
            Conversation.created_at <= end
        ).count()
        escalated = db.query(Conversation).filter(
            Conversation.created_at >= start,
            Conversation.created_at <= end,
            Conversation.escalation_status == EscalationEnum.escalated
        ).count()
        days.append({
            "date": day.strftime("%a"),
            "total": count,
            "auto_handled": count - escalated,
            "escalated": escalated,
        })
    return days
