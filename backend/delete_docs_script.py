from sqlmodel import Session, select
from app.db.session import engine
# Import all relevant models so SQLAlchemy knows about the tables
from app.modules.users.models import User
from app.modules.documents.models import DocumentType, FinalIssuedDocument
from app.modules.applications.models import DocumentApplication, ApplicationProof
from app.modules.payments.models import Payment

def delete_stuck_documents():
    with Session(engine) as session:
        # Get the stuck document types by slug
        stmt = select(DocumentType).where(DocumentType.slug.in_(["demo", "income-certificate", "income-certificate-nothing"]))
        doc_types = session.execute(stmt).scalars().all()
        
        for dt in doc_types:
            print(f"Deleting document type: {dt.name} ({dt.id})")
            
            # Find associated applications
            app_stmt = select(DocumentApplication).where(DocumentApplication.document_type_id == dt.id)
            apps = session.execute(app_stmt).scalars().all()
            
            for app in apps:
                print(f"  Deleting associated application: {app.id}")
                
                # Find final issued documents
                final_stmt = select(FinalIssuedDocument).where(FinalIssuedDocument.application_id == app.id)
                finals = session.execute(final_stmt).scalars().all()
                for f in finals:
                    session.delete(f)

                # Find payments
                pay_stmt = select(Payment).where(Payment.application_id == app.id)
                payments = session.execute(pay_stmt).scalars().all()
                for p in payments:
                    session.delete(p)

                # Find associated proofs
                proof_stmt = select(ApplicationProof).where(ApplicationProof.application_id == app.id)
                proofs = session.execute(proof_stmt).scalars().all()
                for p in proofs:
                    session.delete(p)
                
                # Delete the application
                session.delete(app)
            
            # Delete the document type
            session.delete(dt)
            
        session.commit()
        print("Done.")

if __name__ == "__main__":
    delete_stuck_documents()
