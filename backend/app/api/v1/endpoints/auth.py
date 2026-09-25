"""Authentication endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import AuthenticationError
from app.dependencies.auth import get_current_active_user, get_optional_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest
from app.schemas.user import UserProfile
from app.schemas.common import MessageResponse
from app.services.auth_service import auth_service

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Authenticate user credentials, return access token and set refresh cookie."""
    user = auth_service.authenticate_user(db, email=payload.email, password=payload.password)
    
    device_info = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None

    token_data = auth_service.create_user_tokens(
        db=db,
        user=user,
        device_info=device_info,
        ip_address=ip_address
    )

    # Set httpOnly cookie for refresh token
    is_secure = settings.ENVIRONMENT.lower() == "production"
    if token_data.refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=token_data.refresh_token,
            httponly=True,
            secure=is_secure,
            samesite="lax",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
            path="/"
        )

    return token_data


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    request: Request,
    response: Response,
    payload: Optional[RefreshRequest] = None,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token from cookie or request body."""
    raw_token: Optional[str] = None
    if payload and payload.refresh_token:
        raw_token = payload.refresh_token
    else:
        raw_token = request.cookies.get("refresh_token")

    if not raw_token:
        raise AuthenticationError("Refresh token missing")

    token_data = auth_service.refresh_session(db, raw_refresh_token=raw_token)

    # Set rotated refresh token cookie
    is_secure = settings.ENVIRONMENT.lower() == "production"
    if token_data.refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=token_data.refresh_token,
            httponly=True,
            secure=is_secure,
            samesite="lax",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
            path="/"
        )

    return token_data


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    response: Response,
    payload: Optional[RefreshRequest] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Revoke session and clear cookies."""
    raw_token = None
    if payload and payload.refresh_token:
        raw_token = payload.refresh_token
    else:
        raw_token = request.cookies.get("refresh_token")

    auth_service.logout(db, raw_refresh_token=raw_token, user_id=current_user.id if current_user else None)

    # Clear refresh token cookie
    response.delete_cookie(key="refresh_token", path="/")
    response.delete_cookie(key="access_token", path="/")

    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Return profile, roles, and permissions of the currently authenticated user."""
    role_names = [role.name for role in current_user.roles]
    permission_codes = list(current_user.permission_codes)

    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        phone=current_user.phone,
        is_superuser=current_user.is_superuser,
        is_active=current_user.is_active,
        roles=role_names,
        permissions=permission_codes,
        last_login_at=current_user.last_login_at
    )

