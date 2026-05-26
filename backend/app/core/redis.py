import json
import redis.asyncio as redis
from typing import Any, Optional
from app.core.config import setting

# Initialize Async Redis Client (Assuming REDIS_URL is in your .env)
# Fallback to localhost if not provided for local dev
redis_url = getattr(setting, "REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(redis_url, decode_responses=True)

async def get_cache(key: str) -> Optional[Any]:
    """Retrieves data from Redis cache."""
    data = await redis_client.get(key)
    if data:
        return json.loads(data)
    return None

async def set_cache(key: str, value: Any, ttl_seconds: int = 300):
    """Sets data in Redis cache with an expiration time."""
    await redis_client.setex(key, ttl_seconds, json.dumps(value))

async def delete_cache(key: str):
    """Deletes a specific key from Redis."""
    await redis_client.delete(key)