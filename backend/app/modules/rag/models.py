from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSON
from pgvector.sqlalchemy import Vector
from datetime import datetime
from typing import Dict, Any, Optional
import uuid

class KnowledgeDocument(SQLModel, table=True):
    __tablename__ = "knowledge_documents"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255)
    source: str = Field(max_length=255) # e.g., "Panchayat_Guide.pdf" or URL
    content: str # The full original text
    
    metadata_info: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class KnowledgeChunk(SQLModel, table=True):
    __tablename__ = "knowledge_chunks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    document_id: uuid.UUID = Field(foreign_key="knowledge_documents.id", index=True)
    chunk_text: str
    
    # 768 dimensions for Gemini text-embedding-004
    embedding: Any = Field(sa_column=Column(Vector(768)))
    
    metadata_info: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))