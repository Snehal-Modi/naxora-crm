"""Role and Permission endpoints."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.permissions import require_permission
from app.repositories.role_repo import role_repo
from app.schemas.role import RoleRead
from app.schemas.permission import PermissionRead

router = APIRouter()


@router.get("/roles", response_model=List[RoleRead], dependencies=[Depends(require_permission("users:view"))])
def list_roles(db: Session = Depends(get_db)):
    """List all system roles."""
    roles = role_repo.get_all(db)
    return roles


@router.get("/permissions", response_model=List[PermissionRead], dependencies=[Depends(require_permission("users:view"))])
def list_permissions(db: Session = Depends(get_db)):
    """List all registered system permissions."""
    permissions = role_repo.list_all_permissions(db)
    return permissions

