from sqlmodel import Session
from app.modules.users.repository import UserRepository
from app.modules.users.models import User
from app.integrations.clerk import fetch_clerk_user
from app.core.config import setting 

async def sync_user_from_clerk(session :Session ,clerk_user_id:str) ->User:
    repo = UserRepository(session)

    # 1. Check if user already exists locally
    existing_user = repo.get_by_clerk_id(clerk_user_id)
    if existing_user:
        return existing_user
    
    # 2. Fetch missing data from Clerk API
    clerk_user_data = await fetch_clerk_user(clerk_user_id,setting.CLERK_SECRET_KEY)

    # Clerk returns emails and phones in lists. Safely extract the primary ones.
    email_list = clerk_user_data.get("email_addresses", [])
    email = email_list[0].get("email_address", "") if email_list else ""
    phone_list = clerk_user_data.get("phone_numbers", [])
    phone = phone_list[0].get("phone_number", "") if phone_list else ""

    # Construct full name
    first_name = clerk_user_data.get("first_name", "")
    last_name = clerk_user_data.get("last_name", "")
    full_name = f"{first_name} {last_name}".strip() or "Unknown Citizen"

    # 3. Prepare data for DB
    user_data = {
        "clerk_user_id": clerk_user_id,
        "email": email,
        "full_name": full_name,
        "phone": phone,
        "avatar_url": clerk_user_data.get("image_url"),
        "role": "USER", # Default role for DigiPanch citizens
    }

    # 4. Save to DB
    return repo.create(user_data)


