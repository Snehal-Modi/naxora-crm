"""Schemas package."""

from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.permission import PermissionRead, PermissionCreate
from app.schemas.role import RoleRead, RoleCreate, RoleUpdate
from app.schemas.user import UserRead, UserCreate, UserUpdate, UserProfile
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest

__all__ = [
    "MessageResponse",
    "PaginatedResponse",
    "PermissionRead",
    "PermissionCreate",
    "RoleRead",
    "RoleCreate",
    "RoleUpdate",
    "UserRead",
    "UserCreate",
    "UserUpdate",
    "UserProfile",
    "LoginRequest",
    "TokenResponse",
    "RefreshRequest",
]

