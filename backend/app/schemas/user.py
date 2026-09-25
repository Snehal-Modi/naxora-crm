"""User DTO schemas."""

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.schemas.role import RoleRead


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str
    role_ids: Optional[List[uuid.UUID]] = None


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    role_ids: Optional[List[uuid.UUID]] = None


class UserRead(UserBase):
    id: uuid.UUID
    is_superuser: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    roles: List[RoleRead] = []
    permissions: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class UserProfile(BaseModel):
    id: uuid.UUID
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    is_superuser: bool
    is_active: bool
    roles: List[str]
    permissions: List[str]
    last_login_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

