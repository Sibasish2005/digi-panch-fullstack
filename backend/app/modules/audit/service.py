from sqlmodel import Session
from typing import Dict, Any, Optional
import uuid
from app.modules.audit.models import AuditLog

def log_action(
    session: Session,
    actor_id: uuid.UUID,
    action: str,
    resource_type: str,
    resource_id: uuid.UUID,
    meta: Optional[Dict[str, Any]] = None
):
    """Utility function to be called whenever an officer/admin performs a critical action."""
    audit_entry = AuditLog(
        actor_user_id=actor_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata_info=meta or {}
    )
    session.add(audit_entry)
    session.commit()
    return audit_entry