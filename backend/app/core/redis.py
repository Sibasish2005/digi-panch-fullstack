import json
import logging
import redis.asyncio as redis
from typing import Any, Optional
from app.core.config import setting

logger = logging.getLogger(__name__)

# Initialize Async Redis Client (Assuming REDIS_URL is in your .env)
# Fallback to localhost if not provided for local dev
redis_url = getattr(setting, "REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(redis_url, decode_responses=True)

async def get_cache(key: str) -> Optional[Any]:
    """Retrieves data from Redis cache. Returns None if Redis is unavailable."""
    try:
        data = await redis_client.get(key)
        if data:
            return json.loads(data)
        return None
    except Exception as e:
        logger.warning(f"Redis GET failed for key '{key}': {e}")
        return None

async def set_cache(key: str, value: Any, ttl_seconds: int = 300):
    """Sets data in Redis cache. Silently fails if Redis is unavailable."""
    try:
        await redis_client.setex(key, ttl_seconds, json.dumps(value))
    except Exception as e:
        logger.warning(f"Redis SET failed for key '{key}': {e}")

async def delete_cache(key: str):
    """Deletes a specific key from Redis. Silently fails if Redis is unavailable."""
    try:
        await redis_client.delete(key)
    except Exception as e:
        logger.warning(f"Redis DELETE failed for key '{key}': {e}")