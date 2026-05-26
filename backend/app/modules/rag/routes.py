from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db.session import get_session
from app.api.deps import get_current_user
from app.modules.users.models import User
from app.modules.roles.guards import require_admin
from app.modules.rag.schemas import DocumentIngestRequest
from app.modules.rag.ingestion import ingest_document

router = APIRouter(prefix="/rag", tags=["rag"])

# Only Admins can upload knowledge base documents

@router.post("/ingest", dependencies=[Depends(require_admin)])
async def ingest_knowledge_document(
    data: DocumentIngestRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Ingests a knowledge document (splits into chunks, generates embeddings, and saves to pgvector).
    Restricted to Admins.
    """
    try:
        result = await ingest_document(
            session=session,
            title=data.title,
            source=data.source,
            content=data.content
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
