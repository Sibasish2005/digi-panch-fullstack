import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.news.models import NewsItem
from app.modules.news.schemas import NewsItemCreate, NewsItemUpdate

def get_news(db: Session, active_only: bool = True, limit: Optional[int] = None) -> List[NewsItem]:
    query = db.query(NewsItem)
    if active_only:
        query = query.filter(NewsItem.is_active == True)
    query = query.order_by(NewsItem.created_at.desc())
    if limit is not None:
        query = query.limit(limit)
    return query.all()

def get_news_item_by_id(db: Session, news_id: uuid.UUID) -> Optional[NewsItem]:
    return db.query(NewsItem).filter(NewsItem.id == news_id).first()

def create_news_item(db: Session, obj_in: NewsItemCreate) -> NewsItem:
    db_obj = NewsItem(
        title=obj_in.title,
        description=obj_in.description,
        image_url=obj_in.image_url,
        category=obj_in.category,
        published_date=obj_in.published_date,
        is_active=obj_in.is_active
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_news_item(db: Session, db_obj: NewsItem, obj_in: NewsItemUpdate) -> NewsItem:
    update_data = obj_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_news_item(db: Session, news_id: uuid.UUID) -> None:
    db_obj = get_news_item_by_id(db, news_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
