from sqlmodel import Session
from app.modules.rag.repository import RAGRepository
from app.integrations.embeddings import generate_embedding
from app.integrations.gemini import generate_chat_response # Reusing from Phase 9

async def ask_rag_question(session: Session, question: str) -> str:
    repo = RAGRepository(session)
    
    # 1. Embed the user's question
    question_embedding = await generate_embedding(question)
    
    # 2. Search for the top 3 most relevant chunks using pgvector
    relevant_chunks = repo.similarity_search(question_embedding, top_k=3)
    
    if not relevant_chunks:
        return "I don't have enough specific information in my knowledge base to answer that."
        
    # 3. Construct the augmented context
    context_text = "\n\n---\n\n".join([chunk.chunk_text for chunk in relevant_chunks])
    
    # 4. Create an augmented prompt for Gemini
    augmented_prompt = f"""
    You are DigiPanch AI, an expert Panchayat assistant. Use the following verified context documents to answer the user's question. 
    If the context does not contain the answer, politely say you don't know based on official documents.
    
    CONTEXT:
    {context_text}
    
    USER QUESTION:
    {question}
    """
    
    # 5. Send to Gemini (mocking a ChatMessage history format for your existing integration)
    mock_history = [{"role": "user", "message": augmented_prompt}]
    
    # We call the function from Phase 9
    answer = await generate_chat_response(mock_history)
    return answer