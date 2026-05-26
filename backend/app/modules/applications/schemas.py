from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class ApplicationProofBase(BaseModel):
    file_url: str
    mime_type: str
    file_type: str

class ApplicationProofCreate(ApplicationProofBase):
    pass

class ApplicationProofResponse(ApplicationProofBase):
    id: UUID
    uploaded_by: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class DocumentApplicationCreate(BaseModel):
    document_type_id: UUID
    proofs: List[ApplicationProofCreate]
    remarks: Optional[str] = None

class SimpleUser(BaseModel):
    name: str
    email: Optional[str] = None

class SimpleDocType(BaseModel):
    name: str
    fee_amount: float = 0.0

class FinalIssuedDocumentResponse(BaseModel):
    id: UUID
    pdf_url: str
    document_number: str
    issued_at: datetime
    verification_code: str
    
    class Config:
        from_attributes = True

class DocumentApplicationResponse(BaseModel):
    id: UUID
    application_number: str
    user_id: UUID
    document_type_id: UUID
    assigned_officer_id: Optional[UUID] = None
    status: str
    remarks: Optional[str]
    submitted_at: Optional[datetime]
    created_at: datetime
    
    # Nested fields for UI table
    user: Optional[SimpleUser] = None
    document_type: Optional[SimpleDocType] = None
    final_document: Optional[FinalIssuedDocumentResponse] = None
    
    # We will attach the proofs to the response manually in the service
    proofs: List[ApplicationProofResponse] = []
    
    class Config:
        from_attributes = True