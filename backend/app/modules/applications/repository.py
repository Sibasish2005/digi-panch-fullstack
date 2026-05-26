from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from app.modules.applications.models import DocumentApplication, ApplicationProof
from app.modules.documents.models import FinalIssuedDocument

class ApplicationRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_application(self, app_data: dict) -> DocumentApplication:
        application = DocumentApplication(**app_data)
        self.session.add(application)
        self.session.commit()
        self.session.refresh(application)
        return application

    def add_proofs(self, proofs: List[ApplicationProof]) -> List[ApplicationProof]:
        self.session.add_all(proofs)
        self.session.commit()
        for proof in proofs:
            self.session.refresh(proof)
        return proofs

    def get_by_id(self, application_id: UUID) -> Optional[DocumentApplication]:
        return self.session.get(DocumentApplication, application_id)

    def get_proofs_for_application(self, application_id: UUID) -> List[ApplicationProof]:
        stmt = select(ApplicationProof).where(ApplicationProof.application_id == application_id)
        return self.session.execute(stmt).scalars().all()

    def get_final_document(self, application_id: UUID) -> Optional[FinalIssuedDocument]:
        stmt = select(FinalIssuedDocument).where(FinalIssuedDocument.application_id == application_id)
        return self.session.execute(stmt).scalars().first()

    def list_by_user(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[DocumentApplication]:
        stmt = select(DocumentApplication).where(DocumentApplication.user_id == user_id).offset(skip).limit(limit)
        return self.session.execute(stmt).scalars().all()

    def delete_application(self, application_id: UUID) -> bool:
        app = self.get_by_id(application_id)
        if not app:
            return False
            
        # Delete final documents
        final_doc = self.get_final_document(application_id)
        if final_doc:
            self.session.delete(final_doc)
            
        # Delete proofs
        proofs = self.get_proofs_for_application(application_id)
        for proof in proofs:
            self.session.delete(proof)
            
        # Delete application
        self.session.delete(app)
        self.session.commit()
        return True