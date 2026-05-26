import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class DocumentApplication(SQLModel, table=True):
    __tablename__ = "document_applications"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    application_number: str = Field(max_length=255, unique=True, index=True)
    
    user_id: uuid.UUID = Field(foreign_key="users.id")
    document_type_id: uuid.UUID = Field(foreign_key="document_types.id")
    assigned_officer_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    
    status: str = Field(default="SUBMITTED", max_length=50)
    remarks: Optional[str] = Field(default=None)
    
    submitted_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ApplicationProof(SQLModel, table=True):
    __tablename__ = "application_proofs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    application_id: uuid.UUID = Field(foreign_key="document_applications.id")
    
    file_url: str = Field(max_length=1024)
    mime_type: str = Field(max_length=100)
    file_type: str = Field(max_length=100)  
    
    uploaded_by: uuid.UUID = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)