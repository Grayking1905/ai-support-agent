from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from database import Base

class IntentEnum(str, enum.Enum):
    device_issue = "device_issue"
    account_access = "account_access"
    app_crash = "app_crash"
    billing_payment = "billing_payment"
    warranty_repair = "warranty_repair"
    setup_activation = "setup_activation"
    network_connectivity = "network_connectivity"
    other_general = "other_general"

class EscalationEnum(str, enum.Enum):
    auto_handled = "auto_handled"
    escalated = "escalated"
    pending = "pending"

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, index=True)
    customer_handle = Column(String, nullable=False)
    customer_name = Column(String)
    original_message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    intent = Column(SAEnum(IntentEnum), nullable=True)
    intent_confidence = Column(Float, nullable=True)
    escalation_status = Column(SAEnum(EscalationEnum), default=EscalationEnum.pending)
    escalation_reason = Column(Text, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    drafted_reply = Column(Text, nullable=True)
    historical_apple_reply = Column(Text, nullable=True)
    apple_signoff = Column(String, nullable=True)
    rag_sources_count = Column(Integer, default=0)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    tweets = relationship("Tweet", back_populates="conversation", cascade="all, delete-orphan")

class Tweet(Base):
    __tablename__ = "tweets"

    id = Column(String, primary_key=True, index=True)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    author_type = Column(String, nullable=False)  # "customer" | "apple_support"
    text = Column(Text, nullable=False)
    tweet_at = Column(DateTime, default=datetime.utcnow)
    conversation = relationship("Conversation", back_populates="tweets")
