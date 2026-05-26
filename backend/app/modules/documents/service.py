from sqlmodel import Session
from typing import List
from fastapi import HTTPException, status
from app.modules.documents.repository import DocumentTypeRepository
from app.modules.documents.models import DocumentType
from app.core.redis import get_cache, set_cache # <--- IMPORT REDIS

async def get_all_document_types(session: Session, skip: int = 0, limit: int = 100) -> List[DocumentType]:
    cache_key = f"doc_types_active_{skip}_{limit}"
    
    # Check cache first
    cached_data = await get_cache(cache_key)
    if cached_data:
        return cached_data
        
    repo = DocumentTypeRepository(session)
    docs = repo.get_all(skip=skip, limit=limit, active_only=True)
    
    # Cache for 1 hour (3600 seconds)
    # Convert models to dicts for JSON serialization in Redis
    result = [doc.model_dump(mode="json") for doc in docs]
    await set_cache(cache_key, result, ttl_seconds=3600)
    
    return result

async def create_document_type(session: Session, doc_data: dict) -> DocumentType:
    repo = DocumentTypeRepository(session)
    # Check if slug exists to avoid uniqueness error
    existing = repo.get_by_slug(doc_data.get("slug"))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document type with this slug already exists"
        )
        
    doc_type = repo.create(doc_data)
    
    # We must clear the cache since a new type was added
    # The cache uses keys like doc_types_active_0_100. 
    # For simplicity, if we know the common ones, we can delete them, or we could just use a pattern.
    # In redis, we can use SCAN to delete all matching keys, but since we're using a simple async redis wrapper here:
    # A simple approach for this app is just clearing the most common key or relying on TTL.
    # We will try to clear `doc_types_active_0_100` and `doc_types_active_0_1000`.
    await get_cache("dummy_to_import") # ensure import is used if needed
    from app.core.redis import delete_cache
    await delete_cache("doc_types_active_0_100")
    await delete_cache("doc_types_active_0_1000")
    
    return doc_type

async def get_document_type_by_slug(session: Session, slug: str) -> DocumentType:
    repo = DocumentTypeRepository(session)
    doc_type = repo.get_by_slug(slug)

    if not doc_type or not doc_type.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document type not found",
        )

    return doc_type

async def update_document_type(session: Session, doc_id: str, doc_data: dict) -> DocumentType:
    repo = DocumentTypeRepository(session)
    # Check if slug exists and is different
    if "slug" in doc_data:
        existing = repo.get_by_slug(doc_data["slug"])
        if existing and str(existing.id) != str(doc_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document type with this slug already exists"
            )
            
    doc_type = repo.update(doc_id, doc_data)
    if not doc_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document type not found"
        )
        
    await get_cache("dummy_to_import")
    from app.core.redis import delete_cache
    await delete_cache("doc_types_active_0_100")
    await delete_cache("doc_types_active_0_1000")
    
    return doc_type

async def delete_document_type(session: Session, doc_id: str) -> dict:
    repo = DocumentTypeRepository(session)
    success = repo.delete(doc_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document type not found"
        )
        
    await get_cache("dummy_to_import")
    from app.core.redis import delete_cache
    await delete_cache("doc_types_active_0_100")
    await delete_cache("doc_types_active_0_1000")
    
    return {"message": "Document type deleted successfully"}
