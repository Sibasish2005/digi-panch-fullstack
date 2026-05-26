from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from app.api.deps import get_current_user
from app.modules.users.models import User
from app.modules.roles.guards import require_role
from app.modules.dashboard.schemas import DashboardSummaryResponse
from app.modules.dashboard import service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_summary(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(["Admin", "Officer"]))
):
    """
    Returns an aggregated summary of applications and grievances for the admin/officer dashboard.
    Results are cached for 5 minutes.
    """
    return await service.get_admin_dashboard_summary(session)