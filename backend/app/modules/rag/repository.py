from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from app.modules.rag.models import KnowledgeDocument, KnowledgeChunk

class RAGRepository:
    def __init__(self, session: Session):
        self.session = session

    def save_document(self, doc: KnowledgeDocument) -> KnowledgeDocument:
        self.session.add(doc)
        self.session.commit()
        self.session.refresh(doc)
        return doc

    def save_chunks(self, chunks: List[KnowledgeChunk]):
        self.session.add_all(chunks)
        self.session.commit()

    def similarity_search(self, query_embedding: List[float], top_k: int = 3) -> List[KnowledgeChunk]:
        """
        Uses pgvector's cosine distance operator (<=>) to find closest chunks.
        """
        stmt = select(KnowledgeChunk).order_by(
            KnowledgeChunk.embedding.cosine_distance(query_embedding)
        ).limit(top_k)
        
        return self.session.execute(stmt).scalars().all()