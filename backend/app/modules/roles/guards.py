from typing import List
from fastapi import Depends, HTTPException, status
from app.modules.users.models import User
from app.api.deps import get_current_user

def require_role(allowed_roles: List[str]):
    # Normalize allowed roles to uppercase once
    allowed_roles_upper = [r.upper() for r in allowed_roles]
    
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        # Check against uppercased user role to prevent case-sensitivity bugs
        if current_user.role.upper() not in allowed_roles_upper:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to access this resource"
            )
        return current_user
        
    return role_checker

# Pre-configured guards for easy injection in routes
require_admin = require_role(["ADMIN"])
require_officer = require_role(["OFFICER", "ADMIN"])
require_any_user = require_role(["USER", "OFFICER", "ADMIN"])