"""Authentication dependencies for FastAPI endpoints."""

from typing import Optional
import uuid
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.models.user import User
from app.repositories.user_repo import user_repo

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login",
    auto_error=False
)


def get_token_from_request(request: Request, bearer_token: Optional[str] = Depends(oauth2_scheme)) -> Optional[str]:
    """Retrieve token from either Authorization header or cookies."""
    if bearer_token:
        return bearer_token
    # Fallback to access_token cookie
    return request.cookies.get("access_token")


def get_current_user(
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db)
) -> User:
    """Validate access token and return current User."""
    if not token:
        raise AuthenticationError("Not authenticated")

    payload = decode_access_token(token)
    if not payload:
        raise AuthenticationError("Could not validate credentials")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise AuthenticationError("Invalid token subject")

    try:
        user_id = uuid.UUID(user_id_str)
    except (ValueError, TypeError):
        raise AuthenticationError("Malformed token subject")

    user = user_repo.get_by_id(db, id=user_id)
    if not user:
        raise AuthenticationError("User not found")

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Ensure current user is active."""
    if not current_user.is_active:
        raise AuthenticationError("Inactive user account")
    return current_user


def get_optional_current_user(
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Optional user dependency for endpoints allowing both authenticated and unauthenticated callers."""
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if not payload:
            return None
        user_id_str = payload.get("sub")
        if not user_id_str:
            return None
        user = user_repo.get_by_id(db, id=uuid.UUID(user_id_str))
        if user and user.is_active:
            return user
        return None
    except Exception:
        return None


def get_current_superuser(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Ensure current user is superuser."""
    if not current_user.is_superuser:
        raise PermissionDeniedError("The user doesn't have superuser privileges")
    return current_user

