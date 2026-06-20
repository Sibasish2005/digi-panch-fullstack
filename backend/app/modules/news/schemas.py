import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class NewsItemBase(BaseModel):
    title: str
    description: str
    image_url: str
    category: str
    published_date: str
    is_active: bool = True

class NewsItemCreate(NewsItemBase):
    pass

class NewsItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    published_date: Optional[str] = None
    is_active: Optional[bool] = None

class NewsItemRead(NewsItemBase):
    id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
        orm_mode = True
