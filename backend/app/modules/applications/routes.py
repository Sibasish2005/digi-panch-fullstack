from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from uuid import UUID

from app.db.session import get_session
from app.api.deps import get_current_user
from app.modules.users.models import User
from app.modules.applications import service
from app.modules.applications.schemas import DocumentApplicationCreate, DocumentApplicationResponse

router = APIRouter(prefix="/applications", tags=["applications"])

@router.post("", response_model=DocumentApplicationResponse)
def submit_application(
    data: DocumentApplicationCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Submit a new document application along with proof files."""
    return service.create_application(session=session, user_id=current_user.id, data=data)

@router.get("", response_model=List[DocumentApplicationResponse])
def get_my_applications(
    skip: int = 0, limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all applications submitted by the logged-in citizen."""
    return service.get_user_applications(session=session, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{id}", response_model=DocumentApplicationResponse)
def get_application_details(
    id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific application. Restricted to the owner or officers."""
    return service.get_application_by_id(
        session=session, 
        application_id=id, 
        user_id=current_user.id, 
        user_role=current_user.role
    )

@router.delete("/{id}")
def delete_application(
    id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific application. Restricted to the owner."""
    return service.delete_application_by_id(
        session=session,
        application_id=id,
        user_id=current_user.id
    )