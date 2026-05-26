from pydantic import BaseModel, Field

class DocumentIngestRequest(BaseModel):
    title: str = Field(..., max_length=255, description="Title of the document")
    source: str = Field(..., max_length=255, description="Source name or URL")
    content: str = Field(..., description="Full text content of the knowledge document")
