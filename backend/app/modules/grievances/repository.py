from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from app.modules.grievances.models import Grievance

class GrievanceRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, data: dict) -> Grievance:
        grievance = Grievance(**data)
        self.session.add(grievance)
        self.session.commit()
        self.session.refresh(grievance)
        return grievance

    def get_by_id(self, grievance_id: UUID) -> Optional[Grievance]:
        return self.session.get(Grievance, grievance_id)

    def get_all(self, user_id: Optional[UUID] = None, skip: int = 0, limit: int = 100) -> List[Grievance]:
        stmt = select(Grievance)
        # If user_id is passed, filter by it (for standard users)
        if user_id:
            stmt = stmt.where(Grievance.user_id == user_id)
            
        stmt = stmt.order_by(Grievance.created_at.desc()).offset(skip).limit(limit)
        return self.session.execute(stmt).scalars().all()