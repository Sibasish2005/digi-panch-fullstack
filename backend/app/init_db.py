import asyncio
from sqlmodel import SQLModel, text
from app.db.session import engine
from app.core.config import setting
import logging

# Ensure models are imported so SQLModel registers them
from app.modules.users.models import User
from app.modules.documents.models import DocumentType, FinalIssuedDocument
from app.modules.applications.models import DocumentApplication, ApplicationProof
from app.modules.audit.models import AuditLog
from app.modules.grievances.models import Grievance 
from app.modules.payments.models import Payment
from app.modules.chat.models import ChatSession, ChatMessage
from app.modules.rag.models import KnowledgeDocument, KnowledgeChunk
from app.modules.notifications.models import Notification

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Initializing database...")
    
    with engine.begin() as connection:
        logger.info("Creating pgvector extension if not exists...")
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        
    logger.info("Creating all tables via SQLModel metadata...")
    SQLModel.metadata.create_all(engine)
    logger.info("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
