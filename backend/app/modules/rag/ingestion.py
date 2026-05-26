from sqlmodel import Session
from app.modules.rag.models import KnowledgeDocument, KnowledgeChunk
from app.modules.rag.repository import RAGRepository
from app.integrations.embeddings import generate_embedding

def simple_text_splitter(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """A basic character-level text splitter with overlap."""
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

async def ingest_document(session: Session, title: str, source: str, content: str):
    repo = RAGRepository(session)
    
    # 1. Save the main document
    doc = KnowledgeDocument(title=title, source=source, content=content)
    doc = repo.save_document(doc)
    
    # 2. Split into chunks
    text_chunks = simple_text_splitter(content)
    
    # 3. Embed and prepare chunk records
    db_chunks = []
    for index, text_val in enumerate(text_chunks):
        embedding = await generate_embedding(text_val)
        chunk = KnowledgeChunk(
            document_id=doc.id,
            chunk_text=text_val,
            embedding=embedding,
            metadata_info={"chunk_index": index}
        )
        db_chunks.append(chunk)
        
    # 4. Save chunks to PostgreSQL (pgvector)
    repo.save_chunks(db_chunks)
    return {"message": f"Successfully ingested document: {title} with {len(db_chunks)} chunks."}