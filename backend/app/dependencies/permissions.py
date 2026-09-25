"""Permission and RBAC dependencies."""

from typing import Callable
from fastapi import Depends
from app.core.exceptions import PermissionDeniedError
from app.dependencies.auth import get_current_active_user
from app.models.user import User


def require_permission(permission_code: str) -> Callable[[User], User]:
    """Dependency factory checking that current user possesses a permission code."""
    def permission_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.is_superuser:
            return current_user
        if not current_user.has_permission(permission_code):
            raise PermissionDeniedError(f"Missing required permission: '{permission_code}'")
        return current_user

    return permission_checker


def require_role(role_name: str) -> Callable[[User], User]:
    """Dependency factory checking that current user has a specific role."""
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.is_superuser:
            return current_user
        user_role_names = [role.name for role in current_user.roles]
        if role_name not in user_role_names:
            raise PermissionDeniedError(f"Missing required role: '{role_name}'")
        return current_user

    return role_checker

