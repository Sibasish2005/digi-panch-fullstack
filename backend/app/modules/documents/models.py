from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime
from typing import Optional, List, Any
import uuid

class DocumentType(SQLModel, table=True):
    __tablename__ = "document_types"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=255, unique=True)
    slug: str = Field(max_length=255, unique=True, index=True)
    description: Optional[str] = Field(default=None)
    
    # Store dynamic lists of required files (e.g., [{"name": "Aadhar", "type": "pdf"}])
    required_documents: List[dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    
    fee_amount: float = Field(default=0.0)
    processing_days: int = Field(default=7)
    
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FinalIssuedDocument(SQLModel, table=True):
    __tablename__ = "final_issued_documents"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    application_id: uuid.UUID = Field(foreign_key="document_applications.id", unique=True)
    
    pdf_url: str = Field(max_length=1024)
    document_number: str = Field(max_length=255, unique=True, index=True)
    
    issued_by: uuid.UUID = Field(foreign_key="users.id")
    issued_at: datetime = Field(default_factory=datetime.utcnow)
    
    verification_code: str = Field(max_length=100, unique=True, index=True)
    checksum: str = Field(max_length=255)

    