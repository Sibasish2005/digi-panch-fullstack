import httpx
import jwt
from jwt.algorithms import RSAAlgorithm
from fastapi import HTTPException
from app.core.config import setting

CLERK_ISSUER = setting.CLERK_JWT_ISSUER
_jwks_cache = None

def get_clerk_jwks():
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    jwks_url = f"{CLERK_ISSUER}/.well-known/jwks.json"
    
    # Use sync client!
    with httpx.Client() as client:
        resp = client.get(jwks_url)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        return _jwks_cache

def verify_clerk_token(token: str) -> dict:
    # No more asyncio.run() try/except blocks! Just call it directly:
    jwks = get_clerk_jwks()

    unverified_header = jwt.get_unverified_header(token)
    key_data = None
    for key in jwks["keys"]:
        if key["kid"] == unverified_header.get("kid"):
            key_data = key
            break
            
    if not key_data:
        raise HTTPException(401, "Unable to find signing keys")
        
    public_key = RSAAlgorithm.from_jwk(key_data)
    try:
        payload = jwt.decode(token, public_key, algorithms=["RS256"], issuer=CLERK_ISSUER, leeway=60, options={"verify_aud": False})
        return payload
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {str(e)}")

async def fetch_clerk_user(user_id: str, secret_key: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.clerk.com/v1/users/{user_id}",
            headers={"Authorization": f"Bearer {secret_key}"} 
        )
        resp.raise_for_status()
        return resp.json()

async def update_clerk_user_metadata(user_id: str, role: str, secret_key: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.patch(
            f"https://api.clerk.com/v1/users/{user_id}/metadata",
            headers={"Authorization": f"Bearer {secret_key}"},
            json={"public_metadata": {"role": role}}
        )
        resp.raise_for_status()
        return resp.json()

async def delete_clerk_user(user_id: str, secret_key: str) -> bool:
    async with httpx.AsyncClient() as client:
        resp = await client.delete(
            f"https://api.clerk.com/v1/users/{user_id}",
            headers={"Authorization": f"Bearer {secret_key}"}
        )
        resp.raise_for_status()
        return True