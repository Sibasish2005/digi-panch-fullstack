import httpx
import asyncio
import logging
from app.core.config import setting

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-2.0-flash"
MAX_RETRIES = 3
BASE_RETRY_DELAY = 2  # seconds

async def generate_chat_response(history: list, context_text: str = None) -> str:
    """
    Calls the Gemini API using native httpx.
    `history` is a list of ChatMessage models, already sorted chronologically.
    `context_text` is optional verified information from the RAG knowledge base.
    Includes automatic retry with exponential backoff for rate limit (429) errors.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={setting.GEMINI_API_KEY}"
    
    contents = []
    # Build history context mapping DB roles to Gemini API roles
    for msg in history:
        role = "model" if msg.role in ["model", "bot"] else "user"
        contents.append({
            "role": role,
            "parts": [{"text": msg.message}]
        })
        
    system_instruction_text = "You are DigiPanch AI, a helpful, precise e-governance assistant for Panchayat services. Be polite and concise."
    
    if context_text:
        system_instruction_text += f"\n\nUse the following verified context documents to answer the user's latest question. If the context does not contain the answer, politely say you don't know based on official documents.\n\nCONTEXT:\n{context_text}"
        
    payload = {
        "contents": contents,
        "systemInstruction": {
             "role": "user",
             "parts": [{"text": system_instruction_text}]
        }
    }
    
    async with httpx.AsyncClient() as client:
        for attempt in range(MAX_RETRIES + 1):
            try:
                resp = await client.post(url, json=payload, timeout=30.0)
                resp.raise_for_status()
                    
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
                
            except httpx.HTTPStatusError as e:
                error_body = e.response.text
                status_code = e.response.status_code
                logger.error(f"Gemini API HTTP {status_code} Error (attempt {attempt + 1}): {error_body}")
                
                # Retry on rate limit with exponential backoff
                if status_code == 429 and attempt < MAX_RETRIES:
                    delay = BASE_RETRY_DELAY * (2 ** attempt)  # 2s, 4s, 8s
                    logger.info(f"Rate limited. Retrying in {delay}s (attempt {attempt + 1}/{MAX_RETRIES})...")
                    await asyncio.sleep(delay)
                    continue
                
                # Final failure — return user-facing message
                if status_code == 400:
                    logger.error("Hint: This often means an invalid API key or malformed request.")
                    return "I'm sorry, I encountered a configuration issue. Please contact the administrator."
                elif status_code == 403:
                    logger.error("Hint: API key may be invalid, disabled, or lacking permissions.")
                    return "I'm sorry, the AI service is not properly configured. Please contact the administrator."
                elif status_code == 429:
                    logger.error("Hint: API rate limit or quota exceeded after all retries.")
                    return "I'm currently handling too many requests. Please try again in a moment."
                else:
                    return "I'm sorry, I am experiencing issues at the moment. Please try again later."
            except httpx.ConnectError as e:
                logger.error(f"Cannot connect to Gemini API: {str(e)}")
                return "I'm unable to reach the AI service. Please check your network connection."
            except Exception as e:
                logger.error(f"Exception calling Gemini: {str(e)}", exc_info=True)
                return "I couldn't process that request right now."
    
    return "I couldn't process that request right now."