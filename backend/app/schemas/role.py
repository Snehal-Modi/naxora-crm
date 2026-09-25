"""Role DTO schemas."""

import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.permission import PermissionRead


class RoleBase(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    permission_ids: Optional[List[uuid.UUID]] = None


class RoleUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    permission_ids: Optional[List[uuid.UUID]] = None


class RoleRead(RoleBase):
    id: uuid.UUID
    is_system_role: bool
    permissions: List[PermissionRead] = []

    model_config = ConfigDict(from_attributes=True)

