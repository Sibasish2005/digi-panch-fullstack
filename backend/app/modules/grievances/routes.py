from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from uuid import UUID

from app.db.session import get_session
from app.api.deps import get_current_user
from app.modules.users.models import User
from app.modules.roles.guards import require_officer
from app.modules.grievances import service
from app.modules.grievances.schemas import GrievanceCreate, GrievanceUpdate, GrievanceResponse

router = APIRouter(prefix="/grievances", tags=["grievances"])

@router.post("", response_model=GrievanceResponse)
def submit_grievance(
    data: GrievanceCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Submit a new grievance."""
    return service.create_grievance(session, current_user.id, data)

@router.get("", response_model=List[GrievanceResponse])
def list_grievances(
    skip: int = 0, limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """List grievances. Users see their own; Officers/Admins see all."""
    return service.get_grievances(session, current_user, skip, limit)

@router.get("/{id}", response_model=GrievanceResponse)
def get_grievance(
    id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """View details of a specific grievance."""
    return service.get_grievance_by_id(session, id, current_user)

# OFFICER ONLY ROUTE
@router.post("/{id}/resolve", response_model=GrievanceResponse)
def resolve_grievance(
    id: UUID,
    data: GrievanceUpdate,
    session: Session = Depends(get_session),
    officer: User = Depends(require_officer) # Protected by guard!
):
    """Officer workflow to update status and add resolution notes."""
    return service.update_grievance_status(session, id, officer.id, data)