from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime
from typing import Dict, Any
import uuid

class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    actor_user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    
    action: str = Field(max_length=255) # e.g., "APPROVED_APPLICATION"
    resource_type: str = Field(max_length=100) # e.g., "document_applications"
    resource_id: uuid.UUID = Field(index=True)
    
    metadata_info: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)