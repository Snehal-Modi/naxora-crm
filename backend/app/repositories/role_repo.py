"""Role and Permission repository."""

from typing import Optional, List
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.role import Role
from app.models.permission import Permission
from app.repositories.base import BaseRepository


class RoleRepository(BaseRepository[Role]):
    def __init__(self):
        super().__init__(Role)

    def get_by_name(self, db: Session, name: str) -> Optional[Role]:
        query = select(Role).where(Role.name == name, Role.is_deleted == False)
        return db.scalar(query)

    def get_permission_by_code(self, db: Session, code: str) -> Optional[Permission]:
        query = select(Permission).where(Permission.code == code, Permission.is_deleted == False)
        return db.scalar(query)

    def list_all_permissions(self, db: Session) -> List[Permission]:
        query = select(Permission).where(Permission.is_deleted == False).order_by(Permission.module, Permission.code)
        return list(db.scalars(query).all())

    def get_permissions_by_ids(self, db: Session, permission_ids: List[uuid.UUID]) -> List[Permission]:
        query = select(Permission).where(Permission.id.in_(permission_ids), Permission.is_deleted == False)
        return list(db.scalars(query).all())


role_repo = RoleRepository()

