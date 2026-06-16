from fastapi import APIRouter, Depends
from app.modules.users.models import User
from app.modules.users.schemas import UserResponse, UserUpdate
from app.api.deps import get_current_user, get_session
from sqlmodel import Session

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile.
    Automatically syncs the user from Clerk on their first API request.
    """
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Update the currently authenticated user's profile.
    """
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user