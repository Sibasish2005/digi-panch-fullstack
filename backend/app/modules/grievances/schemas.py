from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class GrievanceCreate(BaseModel):
    subject: str
    description: str
    category: str

class GrievanceUpdate(BaseModel):
    status: str
    resolution_notes: Optional[str] = None

class GrievanceResponse(BaseModel):
    id: UUID
    ticket_number: str
    user_id: UUID
    assigned_officer_id: Optional[UUID]
    subject: str
    description: str
    category: str
    status: str
    resolution_notes: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]
    
    class Config:
        from_attributes = True