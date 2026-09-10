from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ------ Enums ------
class IntentEnum(str):
    pass

# ------ Tweet schemas ------
class TweetBase(BaseModel):
    text: str
    author_type: str  # "customer" | "apple_support"

class TweetResponse(TweetBase):
    id: str
    conversation_id: str
    tweet_at: datetime

    class Config:
        from_attributes = True

# ------ Conversation schemas ------
class ConversationCreate(BaseModel):
    customer_handle: str
    customer_name: Optional[str] = None
    original_message: str

class ConversationResponse(BaseModel):
    id: str
    customer_handle: str
    customer_name: Optional[str] = None
    original_message: str
    created_at: datetime
    intent: Optional[str] = None
    intent_confidence: Optional[float] = None
    escalation_status: str
    escalation_reason: Optional[str] = None
    sentiment_score: Optional[float] = None
    drafted_reply: Optional[str] = None
    rag_sources_count: int
    is_resolved: bool
    tweets: List[TweetResponse] = []

    class Config:
        from_attributes = True

# ------ Agent schemas ------
class AgentProcessRequest(BaseModel):
    customer_handle: str = Field(..., example="@frustrated_user")
    customer_name: Optional[str] = Field(None, example="John Smith")
    message: str = Field(..., example="My iPhone won't turn on after the latest iOS update. Please help!")
    conversation_history: Optional[List[TweetBase]] = None

class IntentClassification(BaseModel):
    intent: str
    confidence: float
    reasoning: str

class EscalationDecision(BaseModel):
    decision: str  # "auto_handled" | "escalated"
    reason: str
    priority: str  # "low" | "medium" | "high" | "urgent"

class AgentProcessResponse(BaseModel):
    conversation_id: str
    classification: IntentClassification
    drafted_reply: str
    escalation: EscalationDecision
    rag_sources_used: int
    sentiment_score: float
    processing_time_ms: int

# ------ Knowledge schemas ------
class KnowledgeSearchRequest(BaseModel):
    query: str
    top_k: int = 5

class KnowledgeSearchResult(BaseModel):
    text: str
    score: float
    intent: Optional[str] = None
    source_handle: Optional[str] = None

class KnowledgeSearchResponse(BaseModel):
    results: List[KnowledgeSearchResult]
    query: str
    total: int

# ------ Analytics schemas ------
class IntentDistributionItem(BaseModel):
    intent: str
    count: int
    percentage: float
    label: str

class AnalyticsSummary(BaseModel):
    total_conversations: int
    auto_handled: int
    escalated: int
    resolved: int
    avg_confidence: float
    intent_distribution: List[IntentDistributionItem]

# ------ Health ------
class SystemHealthResponse(BaseModel):
    status: str
    service: str
    version: str
    qdrant_connected: bool
    postgres_connected: bool
