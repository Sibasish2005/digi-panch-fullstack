from sqlmodel import Session, select
from typing import Optional, List
from uuid import UUID
from app.modules.documents.models import DocumentType

class DocumentTypeRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_all(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[DocumentType]:
        stmt = select(DocumentType)
        if active_only:
            stmt = stmt.where(DocumentType.is_active == True)
        stmt = stmt.offset(skip).limit(limit)
        return self.session.execute(stmt).scalars().all()

    def get_by_slug(self, slug: str) -> Optional[DocumentType]:
        stmt = select(DocumentType).where(DocumentType.slug == slug)
        return self.session.execute(stmt).scalar_one_or_none()

    def get_by_id(self, doc_id: UUID) -> Optional[DocumentType]:
        return self.session.get(DocumentType, doc_id)

    def create(self, data: dict) -> DocumentType:
        doc_type = DocumentType(**data)
        self.session.add(doc_type)
        self.session.commit()
        self.session.refresh(doc_type)
        return doc_type

    def update(self, doc_id: UUID, data: dict) -> Optional[DocumentType]:
        doc_type = self.get_by_id(doc_id)
        if not doc_type:
            return None
        for key, value in data.items():
            setattr(doc_type, key, value)
        self.session.add(doc_type)
        self.session.commit()
        self.session.refresh(doc_type)
        return doc_type

    def delete(self, doc_id: UUID) -> bool:
        doc_type = self.get_by_id(doc_id)
        if not doc_type:
            return False
        self.session.delete(doc_type)
        self.session.commit()
        return True