"""Conversations router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from database import get_db
from models import Conversation, Tweet
from schemas import ConversationResponse, ConversationCreate

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


@router.get("", response_model=List[ConversationResponse])
def list_conversations(
    skip: int = 0,
    limit: int = 50,
    intent: Optional[str] = None,
    escalation_status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Conversation).order_by(Conversation.created_at.desc())
    if intent:
        query = query.filter(Conversation.intent == intent)
    if escalation_status:
        query = query.filter(Conversation.escalation_status == escalation_status)
    return query.offset(skip).limit(limit).all()


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.post("/{conversation_id}/resolve")
def resolve_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv.is_resolved = True
    conv.resolved_at = datetime.utcnow()
    db.commit()
    return {"message": "Conversation marked as resolved", "id": conversation_id}
