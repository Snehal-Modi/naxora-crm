"""Authentication request and response schemas."""

from typing import Optional
from pydantic import BaseModel, EmailStr
from app.schemas.user import UserProfile


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # in seconds
    refresh_token: Optional[str] = None
    user: UserProfile

