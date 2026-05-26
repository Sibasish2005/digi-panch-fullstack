from pydantic import BaseModel
from typing import Optional

class ReviewAction(BaseModel):
    remarks: Optional[str] = None

class IssueDocumentAction(BaseModel):
    file_url: str