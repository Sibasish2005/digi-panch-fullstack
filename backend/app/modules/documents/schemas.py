from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Any

class DocumentTypeBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    required_documents: List[dict[str, Any]] = []
    fee_amount: float = 0.0
    processing_days: int = 7
    is_active: bool = True

class DocumentTypeCreate(DocumentTypeBase):
    pass

class DocumentTypeUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    required_documents: Optional[List[dict[str, Any]]] = None
    fee_amount: Optional[float] = None
    processing_days: Optional[int] = None
    is_active: Optional[bool] = None

class DocumentTypeResponse(DocumentTypeBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True