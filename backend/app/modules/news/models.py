import uuid
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from datetime import datetime

class NewsItem(SQLModel, table=True):
    __tablename__ = "news_items"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(sa_column=Column(String, index=True, nullable=False))
    description: str = Field(sa_column=Column(Text, nullable=False))
    image_url: str = Field(sa_column=Column(String, nullable=False))
    category: str = Field(sa_column=Column(String, index=True, nullable=False))
    published_date: str = Field(sa_column=Column(String, nullable=False))
    is_active: bool = Field(sa_column=Column(Boolean, default=True))
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), default=func.now()))
