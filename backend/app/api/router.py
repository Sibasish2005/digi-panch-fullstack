from fastapi import APIRouter
from app.modules.users.routes import router as users_router
from app.modules.documents.routes import router as documents_router
from app.modules.applications.routes import router as applications_router 
from app.modules.uploads.routes import router as uploads_router 
from app.modules.officer.routes import router as officer_router
from app.modules.admin.routes import router as admin_router
from app.modules.grievances.routes import router as grievances_router 
from app.modules.payments.routes import router as payments_router
from app.modules.payments.webhooks import router as webhooks_router
from app.modules.chat.routes import router as chat_router
from app.modules.dashboard.routes import router as dashboard_router
from app.modules.rag.routes import router as rag_router

api_router = APIRouter()

# Register module routers
api_router.include_router(users_router)
api_router.include_router(documents_router)
api_router.include_router(applications_router) 
api_router.include_router(uploads_router)
api_router.include_router(officer_router)
api_router.include_router(admin_router)
api_router.include_router(grievances_router)
api_router.include_router(payments_router)
api_router.include_router(webhooks_router)
api_router.include_router(chat_router)
api_router.include_router(dashboard_router)
api_router.include_router(rag_router)
