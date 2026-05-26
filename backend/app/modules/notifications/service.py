from sqlmodel import Session, select
from uuid import UUID
from app.modules.notifications.models import Notification

def create_notification(session: Session, user_id: UUID, title: str, message: str) -> Notification:
    notif = Notification(user_id=user_id, title=title, message=message)
    session.add(notif)
    session.commit()
    session.refresh(notif)
    return notif

def get_user_notifications(session: Session, user_id: UUID, limit: int = 50):
    stmt = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc()).limit(limit)
    return session.execute(stmt).scalars().all()

def mark_as_read(session: Session, notification_id: UUID, user_id: UUID):
    notif = session.get(Notification, notification_id)
    if notif and notif.user_id == user_id:
        notif.is_read = True
        session.add(notif)
        session.commit()
        return True
    return False