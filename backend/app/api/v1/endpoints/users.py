"""User management endpoints."""

from typing import List
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password
from app.core.exceptions import ConflictError, NotFoundError
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.repositories.user_repo import user_repo
from app.repositories.role_repo import role_repo
from app.schemas.user import UserRead, UserCreate, UserUpdate

router = APIRouter()


@router.get("", response_model=List[UserRead], dependencies=[Depends(require_permission("users:view"))])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List staff/users (requires users:view permission)."""
    users = user_repo.get_all(db, skip=skip, limit=limit)
    result = []
    for u in users:
        read_obj = UserRead.model_validate(u)
        read_obj.permissions = list(u.permission_codes)
        result.append(read_obj)
    return result


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("users:create"))])
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db)
):
    """Create a new staff user (requires users:create permission)."""
    existing = user_repo.get_by_email(db, email=payload.email)
    if existing:
        raise ConflictError(f"User with email '{payload.email}' already exists")

    hashed_pwd = hash_password(payload.password)
    user = User(
        email=payload.email.lower(),
        hashed_password=hashed_pwd,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        is_active=payload.is_active,
        is_superuser=False
    )

    if payload.role_ids:
        for r_id in payload.role_ids:
            role = role_repo.get_by_id(db, id=r_id)
            if role:
                user.roles.append(role)

    created_user = user_repo.create(db, user)
    res = UserRead.model_validate(created_user)
    res.permissions = list(created_user.permission_codes)
    return res


@router.get("/{id}", response_model=UserRead, dependencies=[Depends(require_permission("users:view"))])
def get_user_by_id(
    id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Get single user by ID."""
    user = user_repo.get_by_id(db, id=id)
    if not user:
        raise NotFoundError("User not found")
    res = UserRead.model_validate(user)
    res.permissions = list(user.permission_codes)
    return res

