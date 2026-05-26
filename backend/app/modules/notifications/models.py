from sqlmodel import SQLModel, Field
from datetime import datetime
import uuid

class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    
    title: str = Field(max_length=255)
    message: str
    is_read: bool = Field(default=False)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)