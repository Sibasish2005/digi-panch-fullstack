from sqlmodel import Session, select
from typing import List
from app.modules.users.models import User
from app.modules.audit.models import AuditLog

def get_users_by_role(session: Session, role: str = None, skip: int = 0, limit: int = 100) -> List[User]:
    stmt = select(User)
    if role:
        stmt = stmt.where(User.role == role)
    stmt = stmt.offset(skip).limit(limit)
    return session.execute(stmt).scalars().all()

def get_recent_audit_logs(session: Session, skip: int = 0, limit: int = 100) -> List[AuditLog]:
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit)
    return session.execute(stmt).scalars().all()

from fastapi import HTTPException, status
from app.integrations.clerk import update_clerk_user_metadata, delete_clerk_user
from app.core.config import setting
from uuid import UUID

async def update_user(session: Session, user_id: UUID, data: dict) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    
    if "role" in data and data["role"] != user.role:
        await update_clerk_user_metadata(user.clerk_user_id, data["role"], setting.CLERK_SECRET_KEY)
        
    for key, value in data.items():
        setattr(user, key, value)
    
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

async def delete_user(session: Session, user_id: UUID) -> dict:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
        
    try:
        await delete_clerk_user(user.clerk_user_id, setting.CLERK_SECRET_KEY)
    except Exception as e:
        print(f"Warning: could not delete user from Clerk: {e}")
    
    session.delete(user)
    session.commit()
    return {"message": "User deleted"}