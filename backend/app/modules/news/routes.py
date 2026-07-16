from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.db.session import get_session
from app.modules.roles.guards import require_admin
from app.modules.news import schemas, service

router = APIRouter()

@router.get("/", response_model=List[schemas.NewsItemRead])
def get_news_items(active_only: bool = False, limit: Optional[int] = None, db: Session = Depends(get_session)):
    """Get all news items. Public endpoint."""
    return service.get_news(db, active_only=active_only, limit=limit)

@router.post("/", response_model=schemas.NewsItemRead, dependencies=[Depends(require_admin)])
def create_news_item(data: schemas.NewsItemCreate, db: Session = Depends(get_session)):
    """Create a new news item (Admin only)."""
    return service.create_news_item(db, data)

@router.patch("/{news_id}", response_model=schemas.NewsItemRead, dependencies=[Depends(require_admin)])
def update_news_item(news_id: uuid.UUID, data: schemas.NewsItemUpdate, db: Session = Depends(get_session)):
    """Update news item (Admin only)."""
    db_obj = service.get_news_item_by_id(db, news_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="News item not found")
    return service.update_news_item(db, db_obj, data)

@router.delete("/{news_id}", dependencies=[Depends(require_admin)])
def delete_news_item(news_id: uuid.UUID, db: Session = Depends(get_session)):
    """Delete news item (Admin only)."""
    db_obj = service.get_news_item_by_id(db, news_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="News item not found")
    service.delete_news_item(db, news_id)
    return {"message": "News item deleted successfully"}
