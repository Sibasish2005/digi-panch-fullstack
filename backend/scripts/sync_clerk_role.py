import asyncio
import os
import sys

# Add the project root to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import select, Session
from app.db.session import engine
from app.modules.users.models import User
from app.core.config import setting
import httpx

async def sync_db_role_to_clerk():
    # 1. Fetch ALL users from DB
    with Session(engine) as session:
        stmt = select(User)
        users = session.execute(stmt).scalars().all()
        
        if not users:
            print("No users found in DB")
            return
            
        print(f"Found {len(users)} users in DB to sync.")
        
        # 2. Update Clerk Metadata for each user
        url_base = "https://api.clerk.com/v1/users/{}/metadata"
        headers = {
            "Authorization": f"Bearer {setting.CLERK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            for user in users:
                print(f"Syncing user: {user.email} (Role: {user.role})")
                
                payload = {
                    "public_metadata": {
                        "role": user.role
                    }
                }
                
                url = url_base.format(user.clerk_user_id)
                resp = await client.patch(url, headers=headers, json=payload)
                
                if resp.status_code == 200:
                    print(f"  -> Successfully updated Clerk metadata to role: {user.role}")
                else:
                    print(f"  -> Failed to update Clerk: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    asyncio.run(sync_db_role_to_clerk())
