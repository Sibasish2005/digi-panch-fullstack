from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    clerk_user_id: str = Field(unique=True, index=True, max_length=255)
    email: str = Field(unique=True, index=True, max_length=255)
    full_name: str = Field(max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    age: Optional[int] = Field(default=None)
    address: Optional[str] = Field(default=None, max_length=500)
    pin: Optional[str] = Field(default=None, max_length=10)
    panchayat: Optional[str] = Field(default=None, max_length=255)
    police_station: Optional[str] = Field(default=None, max_length=255)
    avatar_url: Optional[str] = Field(default=None)
    
    role: str = Field(default="USER", max_length=20)  # USER, OFFICER, ADMIN
    is_active: bool = Field(default=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})