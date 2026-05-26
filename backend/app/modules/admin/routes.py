from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from uuid import UUID

from app.db.session import get_session
from app.modules.roles.guards import require_admin
from app.modules.admin import service

# We reuse the User schema you already built in Phase 2
from app.modules.users.schemas import UserResponse 

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)] # ALL routes require Admin
)

@router.get("/users", response_model=List[UserResponse])
def list_all_users(role: str = None, skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    """Fetch all users, optionally filtered by role."""
    return service.get_users_by_role(session, role, skip, limit)

from app.modules.users.schemas import UserUpdate

@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: UUID, user_data: UserUpdate, session: Session = Depends(get_session)):
    """Admin route to update a User."""
    return await service.update_user(session, user_id, user_data.model_dump(exclude_unset=True))

@router.delete("/users/{user_id}")
async def delete_user(user_id: UUID, session: Session = Depends(get_session)):
    """Admin route to delete a User."""
    return await service.delete_user(session, user_id)

@router.get("/officers", response_model=List[UserResponse])
def list_officers(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    """Fetch all Panchayat Officers."""
    return service.get_users_by_role(session, "OFFICER", skip, limit)

@router.get("/admins", response_model=List[UserResponse])
def list_admins(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    """Fetch all Admins."""
    return service.get_users_by_role(session, "ADMIN", skip, limit)

@router.get("/audit-logs")
def view_audit_logs(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    """View the system-wide audit trail of all officer/admin actions."""
    return service.get_recent_audit_logs(session, skip, limit)

from app.modules.documents.schemas import DocumentTypeCreate, DocumentTypeResponse, DocumentTypeUpdate
from app.modules.documents import service as doc_service

@router.post("/document-types", response_model=DocumentTypeResponse)
async def create_document_type(doc_data: DocumentTypeCreate, session: Session = Depends(get_session)):
    """Admin route to create a new Document Type."""
    return await doc_service.create_document_type(session, doc_data.model_dump())

@router.patch("/document-types/{doc_id}", response_model=DocumentTypeResponse)
async def update_document_type(doc_id: UUID, doc_data: DocumentTypeUpdate, session: Session = Depends(get_session)):
    """Admin route to update a Document Type."""
    return await doc_service.update_document_type(session, doc_id, doc_data.model_dump(exclude_unset=True))

@router.delete("/document-types/{doc_id}")
async def delete_document_type(doc_id: UUID, session: Session = Depends(get_session)):
    """Admin route to delete a Document Type."""
    return await doc_service.delete_document_type(session, doc_id)