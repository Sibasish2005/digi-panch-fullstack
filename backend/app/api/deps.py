import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session

from app.db.session import get_session
from app.integrations.clerk import verify_clerk_token
from app.modules.users.service import sync_user_from_clerk
from app.modules.users.models import User

logger = logging.getLogger(__name__)
security = HTTPBearer()

async def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    try:
        payload = verify_clerk_token(token.credentials)
    except Exception as e:
        logger.warning(f"Auth token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token verification failed or token expired."
        )
    
    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject" # FIXED: 'details' -> 'detail'
        )
    
    # NOTE: Ensure sync_user_from_clerk checks the local DB first.
    # Calling Clerk's API on every single route request will throttle/crash your app.
    user = await sync_user_from_clerk(session, clerk_user_id)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated" # FIXED: 'details' -> 'detail'
        )
    
    return user