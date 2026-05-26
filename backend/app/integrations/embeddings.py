import httpx
from typing import List
from app.core.config import setting

async def generate_embedding(text: str) -> List[float]:
    """
    Calls the Gemini API to generate a vector embedding for a chunk of text.
    Uses the text-embedding-004 model (768 dimensions).
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={setting.GEMINI_API_KEY}"
    
    payload = {
        "model": "models/text-embedding-004",
        "content": {
            "parts": [{"text": text}]
        }
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, timeout=20.0)
        resp.raise_for_status()
        data = resp.json()
        return data["embedding"]["values"]