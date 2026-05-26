from sqlmodel import Session, select, func
from fastapi.concurrency import run_in_threadpool
from app.modules.applications.models import DocumentApplication
from app.modules.grievances.models import Grievance
from app.core.redis import get_cache, set_cache

async def get_admin_dashboard_summary(session: Session) -> dict:
    cache_key = "admin_dashboard_summary"
    
    # 1. Check Redis Cache First
    cached_data = await get_cache(cache_key)
    if cached_data:
        return cached_data
        
    # 2. Database Queries
    total_apps = await run_in_threadpool(
        lambda: session.exec(select(func.count(DocumentApplication.id))).one()
    )
    pending_apps = await run_in_threadpool(
        lambda: session.exec(
            select(func.count(DocumentApplication.id)).where(DocumentApplication.status == "Pending")
        ).one()
    )
    approved_apps = await run_in_threadpool(
        lambda: session.exec(
            select(func.count(DocumentApplication.id)).where(DocumentApplication.status == "Approved")
        ).one()
    )
    
    total_grievances = await run_in_threadpool(
        lambda: session.exec(select(func.count(Grievance.id))).one()
    )
    pending_grievances = await run_in_threadpool(
        lambda: session.exec(
            select(func.count(Grievance.id)).where(Grievance.status == "Pending")
        ).one()
    )
    
    result = {
        "total_applications": total_apps,
        "pending_applications": pending_apps,
        "approved_applications": approved_apps,
        "total_grievances": total_grievances,
        "pending_grievances": pending_grievances
    }
    
    # 3. Save to Redis Cache (TTL: 5 Minutes / 300 Seconds)
    await set_cache(cache_key, result, ttl_seconds=300)
    
    return result
