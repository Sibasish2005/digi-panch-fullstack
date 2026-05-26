from sqlmodel import Session
from uuid import UUID
from fastapi import HTTPException, status
from datetime import datetime
import random
import string
from app.modules.applications.repository import ApplicationRepository
from app.modules.applications.schemas import DocumentApplicationCreate
from app.modules.applications.models import ApplicationProof
from app.modules.documents.repository import DocumentTypeRepository

def generate_application_number() -> str:
    """Generates a unique tracking number like APP-20260521-ABCD"""
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"APP-{date_str}-{random_str}"

def create_application(session: Session, user_id: UUID, data: DocumentApplicationCreate):
    app_repo = ApplicationRepository(session)
    doc_repo = DocumentTypeRepository(session)
    
    # 1. Verify document type actually exists
    doc_type = doc_repo.get_by_id(data.document_type_id)
    if not doc_type or not doc_type.is_active:
        raise HTTPException(status_code=404, detail="Invalid or inactive Document Type")
        
    # 2. Determine initial status based on fee
    initial_status = "PENDING_PAYMENT" if doc_type.fee_amount > 0 else "SUBMITTED"

    # 3. Create the main application record
    app_data = {
        "application_number": generate_application_number(),
        "user_id": user_id,
        "document_type_id": data.document_type_id,
        "status": initial_status,
        "remarks": data.remarks,
        "submitted_at": datetime.utcnow()
    }
    application = app_repo.create_application(app_data)
    
    # 3. Save all attached proof documents
    proofs = []
    for p in data.proofs:
        proof = ApplicationProof(
            application_id=application.id,
            file_url=p.file_url,
            mime_type=p.mime_type,
            file_type=p.file_type,
            uploaded_by=user_id
        )
        proofs.append(proof)
        
    if proofs:
        app_repo.add_proofs(proofs)
        
    # 4. Construct response
    session.refresh(application)
    response_dict = application.model_dump()
    response_dict["proofs"] = proofs
    return response_dict

def get_user_applications(session: Session, user_id: UUID, skip: int = 0, limit: int = 100):
    repo = ApplicationRepository(session)
    doc_repo = DocumentTypeRepository(session)
    apps = repo.list_by_user(user_id, skip, limit)
    
    # Attach proofs and final document to each application for the frontend
    results = []
    for app in apps:
        app_dict = app.model_dump()
        app_dict["proofs"] = repo.get_proofs_for_application(app.id)
        
        doc_type = doc_repo.get_by_id(app.document_type_id)
        if doc_type:
            app_dict["document_type"] = {"name": doc_type.name, "fee_amount": doc_type.fee_amount}
            
        if app.status == "DOCUMENT_ISSUED":
            final_doc = repo.get_final_document(app.id)
            if final_doc:
                app_dict["final_document"] = final_doc.model_dump()
                
        results.append(app_dict)
    return results

def get_application_by_id(session: Session, application_id: UUID, user_id: UUID, user_role: str):
    repo = ApplicationRepository(session)
    app = repo.get_by_id(application_id)
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # SECURITY: Only the owner, an officer, or admin can view this specific application
    if app.user_id != user_id and user_role not in ["OFFICER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this application")
        
    app_dict = app.model_dump()
    app_dict["proofs"] = repo.get_proofs_for_application(app.id)
    
    if app.status == "DOCUMENT_ISSUED":
        final_doc = repo.get_final_document(app.id)
        if final_doc:
            app_dict["final_document"] = final_doc.model_dump()
            
    return app_dict

def delete_application_by_id(session: Session, application_id: UUID, user_id: UUID):
    repo = ApplicationRepository(session)
    app = repo.get_by_id(application_id)
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # SECURITY: Only the owner can delete their application
    if app.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this application")
        
    success = repo.delete_application(application_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete application")
    return {"message": "Application deleted successfully"}