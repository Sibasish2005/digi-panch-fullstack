import httpx
import logging
from app.core.config import setting

logger = logging.getLogger(__name__)

async def generate_deepseek_response(history: list, context_text: str = None) -> str:
    """
    Calls the DeepSeek API using native httpx.
    `history` is a list of ChatMessage models, already sorted chronologically.
    `context_text` is optional verified information from the RAG knowledge base.
    """
    if not setting.DEEPSEEK_API_KEY:
        logger.error("DEEPSEEK_API_KEY is not configured.")
        return "I'm sorry, my backup AI service is not configured."

    url = "https://api.deepseek.com/chat/completions"
    
    messages = []
    
    system_instruction_text = "You are DigiPanch AI, a helpful, precise e-governance assistant for Panchayat services. Be polite and concise. Always greet the user by their name if it is provided in the context."
    
    if context_text:
        system_instruction_text += f"\n\nUse the following verified context documents to answer the user's latest question. If the context does not contain the answer, politely say you don't know based on official documents.\n\nCONTEXT:\n{context_text}"
        
    messages.append({"role": "system", "content": system_instruction_text})
        
    for msg in history:
        role = "assistant" if msg.role in ["model", "bot", "assistant"] else "user"
        messages.append({
            "role": role,
            "content": msg.message
        })
        
    payload = {
        "model": "deepseek-chat",
        "messages": messages,
        "temperature": 0.3
    }
    
    headers = {
        "Authorization": f"Bearer {setting.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, json=payload, headers=headers, timeout=30.0)
            resp.raise_for_status()
            
            data = resp.json()
            return data["choices"][0]["message"]["content"]
            
        except httpx.HTTPStatusError as e:
            logger.error(f"DeepSeek API HTTP {e.response.status_code} Error: {e.response.text}")
            return "I'm sorry, my backup AI service is currently experiencing issues."
        except Exception as e:
            logger.error(f"Exception calling DeepSeek: {str(e)}", exc_info=True)
            return "I couldn't process that request right now."
