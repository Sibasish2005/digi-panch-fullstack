import uuid
import hashlib
from datetime import datetime
from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.modules.applications.models import DocumentApplication
from app.modules.documents.models import FinalIssuedDocument
from app.modules.audit.service import log_action  # <-- Imported the audit logger

# from weasyprint import HTML  <-- We will use this later for real PDFs

from app.modules.users.models import User
from app.modules.documents.models import DocumentType

def get_all_applications(session: Session, status_filter: str = None, skip: int = 0, limit: int = 100):
    stmt = select(DocumentApplication, User, DocumentType).join(User, DocumentApplication.user_id == User.id).join(DocumentType, DocumentApplication.document_type_id == DocumentType.id)
    if status_filter:
        stmt = stmt.where(DocumentApplication.status == status_filter)
    stmt = stmt.offset(skip).limit(limit)
    
    results = session.execute(stmt).all()
    
    response = []
    for app, user, doc_type in results:
        app_dict = app.model_dump()
        app_dict["user"] = {"name": user.full_name, "email": user.email}
        app_dict["document_type"] = {"name": doc_type.name}
        response.append(app_dict)
        
    return response

def review_application(session: Session, app_id: uuid.UUID, officer_id: uuid.UUID, new_status: str, remarks: str = None):
    app = session.get(DocumentApplication, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    app.status = new_status
    app.assigned_officer_id = officer_id
    if remarks:
        app.remarks = remarks

    session.add(app)
    session.commit()
    session.refresh(app)
    
    # --- NEW: Log the review action in the audit trail ---
    log_action(
        session=session,
        actor_id=officer_id,
        action=f"MARKED_APPLICATION_{new_status}",
        resource_type="document_applications",
        resource_id=app_id,
        meta={"remarks": remarks}
    )
    
    return app

def issue_document(session: Session, app_id: uuid.UUID, officer_id: uuid.UUID, file_url: str):
    app = session.get(DocumentApplication, app_id)
    if not app or app.status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Application must be APPROVED before issuing a document."
        )
        
    # 1. Generate secure identifiers
    date_str = datetime.utcnow().strftime('%Y%m%d')
    doc_number = f"DOC-{date_str}-{str(uuid.uuid4())[:8].upper()}"
    verification_code = str(uuid.uuid4())
    checksum = hashlib.sha256(doc_number.encode()).hexdigest()
    
    # 2. Use the provided uploaded file URL
    pdf_url = file_url 
    
    # 3. Save Final Document Record
    final_doc = FinalIssuedDocument(
        application_id=app_id,
        pdf_url=pdf_url,
        document_number=doc_number,
        issued_by=officer_id,
        verification_code=verification_code,
        checksum=checksum
    )
    
    # 4. Update Main Application Status
    app.status = "DOCUMENT_ISSUED"
    
    session.add(final_doc)
    session.add(app)
    session.commit()
    session.refresh(final_doc)
    
    # --- NEW: Log the document generation in the audit trail ---
    log_action(
        session=session,
        actor_id=officer_id,
        action="ISSUED_DOCUMENT",
        resource_type="final_issued_documents",
        resource_id=final_doc.id,
        meta={
            "document_number": doc_number,
            "application_id": str(app_id)
        }
    )
    
    return final_doc