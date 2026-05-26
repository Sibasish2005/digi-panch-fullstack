from sqlmodel import Session
from uuid import UUID
from fastapi import HTTPException
from app.modules.chat.repository import ChatRepository
from app.modules.chat.schemas import ChatSessionCreate, ChatMessageCreate
from app.integrations.gemini import generate_chat_response

def create_chat_session(session: Session, user_id: UUID, data: ChatSessionCreate):
    repo = ChatRepository(session)
    return repo.create_session(user_id, data.title)

def get_chat_history(session: Session, user_id: UUID, skip: int = 0, limit: int = 100):
    repo = ChatRepository(session)
    return repo.get_user_sessions(user_id, skip, limit)

def get_messages(session: Session, user_id: UUID, session_id: UUID):
    repo = ChatRepository(session)
    chat_session = repo.get_session_by_id(session_id)
    if not chat_session or chat_session.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this session")
    return repo.get_session_messages(session_id)

from app.modules.rag.repository import RAGRepository
from app.integrations.embeddings import generate_embedding

async def send_message(session: Session, user_id: UUID, data: ChatMessageCreate):
    repo = ChatRepository(session)
    
    # 1. Verify ownership of the session
    chat_session = repo.get_session_by_id(data.session_id)
    if not chat_session or chat_session.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to use this session")
        
    # 2. Save the user's message
    repo.add_message(data.session_id, role="user", message=data.message)
    
    # 3. Fetch history for AI context (this includes the user message we just saved)
    history = repo.get_session_messages(data.session_id)
    
    # 4. RAG Retrieval - Embed the new message and search
    rag_repo = RAGRepository(session)
    try:
        question_embedding = await generate_embedding(data.message)
        relevant_chunks = rag_repo.similarity_search(question_embedding, top_k=3)
        
        context_text = None
        if relevant_chunks:
            context_text = "\n\n---\n\n".join([chunk.chunk_text for chunk in relevant_chunks])
    except Exception as e:
        # If RAG fails (e.g. pgvector not ready or embedding fails), fallback to normal chat gracefully
        print(f"RAG Retrieval failed: {e}")
        context_text = None
    
    # 5. Generate the response from Gemini
    bot_reply_text = await generate_chat_response(history, context_text=context_text)
    
    # 6. Save and return the bot's message
    bot_msg = repo.add_message(data.session_id, role="model", message=bot_reply_text)
    
    return bot_msg