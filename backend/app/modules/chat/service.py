from sqlmodel import Session
from uuid import UUID
from fastapi import HTTPException
from app.modules.chat.repository import ChatRepository
from app.modules.chat.schemas import ChatSessionCreate, ChatMessageCreate
from app.integrations.gemini import generate_chat_response
from sqlmodel import select
from app.integrations.deepseek import generate_deepseek_response
from app.modules.users.models import User
from app.modules.applications.models import DocumentApplication
from app.modules.grievances.models import Grievance
import logging

logger = logging.getLogger(__name__)

def create_chat_session(session: Session, user_id: UUID, data: ChatSessionCreate):
    repo = ChatRepository(session)
    chat_session = repo.create_session(user_id, data.title)
    
    user_record = session.get(User, user_id)
    greeting = f"Hello {user_record.full_name}, how can I help you today?" if user_record else "Hello, how can I help you today?"
    repo.add_message(chat_session.id, role="model", message=greeting)
    
    return chat_session

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
    
    # 4. Fetch User-Specific Context (Profile, Applications & Grievances)
    user_context = "--- USER SPECIFIC DATA (Use this if the user asks about their own profile, applications or grievances) ---\n"
    
    user_record = session.get(User, user_id)
    if user_record:
        user_context += "USER PROFILE:\n"
        user_context += f"- Name: {user_record.full_name}\n"
        user_context += f"- Email: {user_record.email}\n"
        user_context += f"- Role: {user_record.role}\n"
        if user_record.phone: user_context += f"- Phone: {user_record.phone}\n"
        if user_record.age: user_context += f"- Age: {user_record.age}\n"
        if user_record.address: user_context += f"- Address: {user_record.address}\n"
        if user_record.pin: user_context += f"- PIN: {user_record.pin}\n"
        if user_record.panchayat: user_context += f"- Panchayat: {user_record.panchayat}\n"
        if user_record.police_station: user_context += f"- Police Station: {user_record.police_station}\n"
        user_context += "\n"
    
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
    
    # 6. Generate the response from Gemini or DeepSeek fallback
    try:
        bot_reply_text = await generate_chat_response(history, context_text=final_context)
    except Exception as e:
        logger.warning(f"Gemini API failed: {e}. Falling back to DeepSeek.")
        bot_reply_text = await generate_deepseek_response(history, context_text=final_context)
    
    # 7. Save and return the bot's message
    bot_msg = repo.add_message(data.session_id, role="model", message=bot_reply_text)
    
    return bot_msg