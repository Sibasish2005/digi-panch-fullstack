from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from app.db.session import get_session
from app.modules.documents.schemas import DocumentTypeResponse
from app.modules.documents import service

router = APIRouter(prefix="/document-types", tags=["documents"])

# ADD `async` here
@router.get("", response_model=List[DocumentTypeResponse])
async def list_document_types(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    # ADD `await` here
    return await service.get_all_document_types(session=session, skip=skip, limit=limit)

# ADD `async` here
@router.get("/{slug}", response_model=DocumentTypeResponse)
async def get_document_type(slug: str, session: Session = Depends(get_session)):
    # ADD `await` here
    return await service.get_document_type_by_slug(session=session, slug=slug)