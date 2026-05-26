from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from app.modules.chat.models import ChatSession, ChatMessage

class ChatRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_session(self, user_id: UUID, title: str) -> ChatSession:
        chat_session = ChatSession(user_id=user_id, title=title)
        self.session.add(chat_session)
        self.session.commit()
        self.session.refresh(chat_session)
        return chat_session

    def get_user_sessions(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[ChatSession]:
        stmt = select(ChatSession).where(ChatSession.user_id == user_id).order_by(ChatSession.updated_at.desc()).offset(skip).limit(limit)
        return self.session.execute(stmt).scalars().all()

    def get_session_by_id(self, session_id: UUID) -> Optional[ChatSession]:
        return self.session.get(ChatSession, session_id)

    def add_message(self, session_id: UUID, role: str, message: str) -> ChatMessage:
        msg = ChatMessage(session_id=session_id, role=role, message=message)
        self.session.add(msg)
        self.session.commit()
        self.session.refresh(msg)
        return msg

    def get_session_messages(self, session_id: UUID, limit: int = 100) -> List[ChatMessage]:
        stmt = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).limit(limit)
        return self.session.execute(stmt).scalars().all()