from sqlmodel import Session
from uuid import UUID
from fastapi import HTTPException, status
from datetime import datetime
import random
import string
from app.modules.grievances.repository import GrievanceRepository
from app.modules.grievances.schemas import GrievanceCreate, GrievanceUpdate
from app.modules.audit.service import log_action

def generate_ticket_number() -> str:
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"TKT-{date_str}-{random_str}"

def create_grievance(session: Session, user_id: UUID, data: GrievanceCreate):
    repo = GrievanceRepository(session)
    grievance_data = data.model_dump()
    grievance_data["user_id"] = user_id
    grievance_data["ticket_number"] = generate_ticket_number()
    return repo.create(grievance_data)

def get_grievances(session: Session, current_user, skip: int = 0, limit: int = 100):
    repo = GrievanceRepository(session)
    # RBAC filtering: Citizens only see their own tickets. Officers/Admins see all.
    if current_user.role == "USER":
        return repo.get_all(user_id=current_user.id, skip=skip, limit=limit)
    return repo.get_all(skip=skip, limit=limit)

def get_grievance_by_id(session: Session, grievance_id: UUID, current_user):
    repo = GrievanceRepository(session)
    grievance = repo.get_by_id(grievance_id)
    
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
        
    # RBAC Check
    if current_user.role == "USER" and grievance.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this grievance")
        
    return grievance
    
def update_grievance_status(session: Session, grievance_id: UUID, officer_id: UUID, data: GrievanceUpdate):
    repo = GrievanceRepository(session)
    grievance = repo.get_by_id(grievance_id)
    
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
        
    grievance.status = data.status
    grievance.assigned_officer_id = officer_id
    
    if data.resolution_notes:
        grievance.resolution_notes = data.resolution_notes
        
    if data.status in ["RESOLVED", "CLOSED", "REJECTED"]:
        grievance.resolved_at = datetime.utcnow()
        
    session.add(grievance)
    session.commit()
    session.refresh(grievance)
    
    # Log the action in the audit trail!
    log_action(
        session=session,
        actor_id=officer_id,
        action=f"UPDATED_GRIEVANCE_{data.status}",
        resource_type="grievances",
        resource_id=grievance_id,
        meta={"notes": data.resolution_notes}
    )
    
    return grievance