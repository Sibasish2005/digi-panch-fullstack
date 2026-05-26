from fastapi import APIRouter, Depends
from app.modules.users.models import User
from app.modules.users.schemas import UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile.
    Automatically syncs the user from Clerk on their first API request.
    """
    return current_user