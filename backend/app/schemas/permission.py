"""Permission DTO schemas."""

import uuid
from pydantic import BaseModel, ConfigDict


class PermissionBase(BaseModel):
    code: str
    module: str
    description: str | None = None


class PermissionCreate(PermissionBase):
    pass


class PermissionRead(PermissionBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

