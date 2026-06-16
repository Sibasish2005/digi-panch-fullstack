from sqlmodel import Session
from uuid import UUID
from fastapi import HTTPException
from app.modules.chat.repository import ChatRepository
from app.modules.chat.schemas import ChatSessionCreate, ChatMessageCreate
from app.integrations.gemini import generate_chat_response
from sqlmodel import select
from app.modules.applications.models import DocumentApplication
from app.modules.grievances.models import Grievance

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
    
    # 4. Fetch User-Specific Context (Applications & Grievances)
    user_context = "--- USER SPECIFIC DATA (Use this if the user asks about their own applications or grievances) ---\n"
    
    apps_stmt = select(DocumentApplication).where(DocumentApplication.user_id == user_id)
    user_apps = session.exec(apps_stmt).all()
    if user_apps:
        user_context += "USER'S APPLICATIONS:\n"
        for app in user_apps:
            user_context += f"- Application #{app.application_number} | Status: {app.status}\n"
    else:
        user_context += "User has no active applications.\n"
        
    grievances_stmt = select(Grievance).where(Grievance.user_id == user_id)
    user_grievances = session.exec(grievances_stmt).all()
    if user_grievances:
        user_context += "\nUSER'S GRIEVANCES:\n"
        for g in user_grievances:
            user_context += f"- Grievance #{g.ticket_number} (Subject: {g.subject}) | Status: {g.status}\n"
    else:
        user_context += "\nUser has no active grievances.\n"
        
    user_context += "--------------------------------------------------------\n\n"

    # 5. RAG Retrieval - Embed the new message and search
    rag_repo = RAGRepository(session)
    try:
        question_embedding = await generate_embedding(data.message)
        relevant_chunks = rag_repo.similarity_search(question_embedding, top_k=3)
        
        context_text = None
        if relevant_chunks:
            context_text = "\n\n--- KNOWLEDGE BASE ---\n\n".join([chunk.chunk_text for chunk in relevant_chunks])
    except Exception as e:
        # If RAG fails (e.g. pgvector not ready or embedding fails), fallback to normal chat gracefully
        print(f"RAG Retrieval failed: {e}")
        context_text = None
        
    # Combine User Context with RAG Context
    final_context = user_context + (context_text if context_text else "")
    
    # 6. Generate the response from Gemini
    bot_reply_text = await generate_chat_response(history, context_text=final_context)
    
    # 6. Save and return the bot's message
    bot_msg = repo.add_message(data.session_id, role="model", message=bot_reply_text)
    
    return bot_msg