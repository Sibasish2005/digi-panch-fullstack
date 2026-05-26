from sqlmodel import Session, select
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.modules.users.models import User

class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_clerk_id(self, clerk_user_id: str) -> Optional[User]:
        stmt = select(User).where(User.clerk_user_id == clerk_user_id)
        result = self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    def get_by_id(self, user_id: UUID) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    def create(self, user_data: dict) -> User:
        user = User(**user_data)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user
    
    def update(self, user_id: UUID, update_data: dict) -> Optional[User]:
        user = self.get_by_id(user_id)
        if not user:
            return None
        for key, value in update_data.items():
            setattr(user, key, value)
        user.updated_at = datetime.utcnow()
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def list(self, skip: int = 0, limit: int = 100) -> list[User]:
        stmt = select(User).offset(skip).limit(limit)
        result = self.session.execute(stmt)
        return result.scalars().all()