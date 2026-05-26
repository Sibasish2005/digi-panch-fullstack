from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.modules.users.models import User
from app.integrations.imagekit import generate_imagekit_auth_signature

router = APIRouter(prefix="/uploads", tags=["uploads"])

@router.get("/auth")
def get_imagekit_auth(current_user: User = Depends(get_current_user)):
    """
    Returns the token, expiry, and signature required for the frontend
    to securely upload files directly to ImageKit. Protected route.
    """
    return generate_imagekit_auth_signature()