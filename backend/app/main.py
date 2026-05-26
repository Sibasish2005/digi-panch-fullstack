from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import setting
from app.api.router import api_router 

# Import the handler and exception, but get the limiter from our new core file
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter 

# Keep models here so Alembic/SQLModel registers them in memory
from app.modules.users.models import User
from app.modules.documents.models import DocumentType, FinalIssuedDocument
from app.modules.audit.models import AuditLog
from app.modules.grievances.models import Grievance 
from app.modules.payments.models import Payment
from app.modules.chat.models import ChatSession, ChatMessage
from app.modules.rag.models import KnowledgeDocument, KnowledgeChunk
from app.modules.notifications.models import Notification

from app.core.exceptions import add_exception_handlers

app = FastAPI(
    title=setting.APP_NAME,
    version=setting.APP_VERSION
)

# 1. Exception Handlers
add_exception_handlers(app)

# 2. Rate Limiter Configuration
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 3. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://digi-panch.vercel.app",
        "https://digi-panch-fullstack.vercel.app",
    ], # Update with frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "environment": setting.ENVIRONMENT
    }

# 4. API Routers
app.include_router(api_router, prefix="/api/v1")
