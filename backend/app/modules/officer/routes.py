from fastapi import APIRouter, Depends
from sqlmodel import Session
from uuid import UUID
from typing import Optional, List

from app.db.session import get_session
from app.modules.roles.guards import require_officer
from app.modules.users.models import User
from app.modules.officer import service
from app.modules.officer.schemas import ReviewAction, IssueDocumentAction
from app.modules.applications.schemas import DocumentApplicationResponse

# Force all routes in this router to require an OFFICER role
router = APIRouter(
    prefix="/officer/applications", 
    tags=["officer workflow"],
    dependencies=[Depends(require_officer)]
)
@router.get("", response_model=List[DocumentApplicationResponse])
def list_applications(
    status: Optional[str] = None, 
    skip: int = 0, 
    limit: int = 100, 
    session: Session = Depends(get_session)
):
    """View all applications. Optionally filter by status (e.g., 'SUBMITTED')."""
    return service.get_all_applications(session, status_filter=status, skip=skip, limit=limit)

@router.post("/{id}/approve", response_model=DocumentApplicationResponse)
def approve_application(
    id: UUID, 
    action: ReviewAction, 
    session: Session = Depends(get_session),
    officer: User = Depends(require_officer)
):
    """Mark an application as APPROVED."""
    return service.review_application(session, id, officer.id, "APPROVED", action.remarks)

@router.post("/{id}/reject", response_model=DocumentApplicationResponse)
def reject_application(
    id: UUID, 
    action: ReviewAction, 
    session: Session = Depends(get_session),
    officer: User = Depends(require_officer)
):
    """Mark an application as REJECTED."""
    return service.review_application(session, id, officer.id, "REJECTED", action.remarks)

@router.post("/{id}/issue-document")
def issue_final_document(
    id: UUID, 
    action: IssueDocumentAction,
    session: Session = Depends(get_session),
    officer: User = Depends(require_officer)
):
    """Generate the final PDF certificate and mark application as DOCUMENT_ISSUED."""
    return service.issue_document(session, id, officer.id, action.file_url)