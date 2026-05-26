from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid

class Grievance(SQLModel, table=True):
    __tablename__ = "grievances"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    ticket_number: str = Field(max_length=255, unique=True, index=True)
    
    user_id: uuid.UUID = Field(foreign_key="users.id")
    assigned_officer_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    
    subject: str = Field(max_length=255)
    description: str
    category: str = Field(max_length=100) # e.g., Water, Roads, Electricity
    
    # Status: OPEN | IN_PROGRESS | RESOLVED | CLOSED | REJECTED
    status: str = Field(default="OPEN", max_length=50)
    
    resolution_notes: Optional[str] = Field(default=None)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = Field(default=None)