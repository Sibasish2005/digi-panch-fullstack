from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any

class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ChatSessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    session_id: UUID
    message: str

class ChatMessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    role: str
    message: str
    metadata_info: Dict[str, Any]
    created_at: datetime
    
    class Config:
        from_attributes = True