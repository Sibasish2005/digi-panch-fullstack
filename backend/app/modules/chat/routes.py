from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from uuid import UUID

from app.db.session import get_session
from app.api.deps import get_current_user
from app.modules.users.models import User
from app.modules.chat import service
from app.modules.chat.schemas import ChatSessionCreate, ChatSessionResponse, ChatMessageCreate, ChatMessageResponse

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/sessions", response_model=ChatSessionResponse)
def create_session(
    data: ChatSessionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Creates a new chat session for the citizen."""
    return service.create_chat_session(session, current_user.id, data)

@router.get("/history", response_model=List[ChatSessionResponse])
def list_sessions(
    skip: int = 0, limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Fetches a list of all chat sessions for the current user."""
    return service.get_chat_history(session, current_user.id, skip, limit)

@router.get("/messages", response_model=List[ChatMessageResponse])
def get_messages(
    session_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all messages for a specific chat session."""
    return service.get_messages(session, current_user.id, session_id)

@router.post("/messages", response_model=ChatMessageResponse)
async def send_message(
    data: ChatMessageCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Sends a message to the AI and returns the AI's response message."""
    return await service.send_message(session, current_user.id, data)