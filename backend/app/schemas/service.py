"""Service and ServiceCategory Pydantic schemas."""

from datetime import datetime
from decimal import Decimal
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.company import StaffSummary


class ServiceCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True


class ServiceCategoryCreate(ServiceCategoryBase):
    pass


class ServiceCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ServiceCategoryRead(ServiceCategoryBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ServiceSummary(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    delivery_mode: str = "online"
    fee: Decimal = Decimal("0.00")
    status: str = "draft"

    model_config = ConfigDict(from_attributes=True)


class ServiceBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    delivery_mode: str = "online"  # online, offline, hybrid
    fee: Decimal = Decimal("0.00")
    status: str = "draft"  # draft, active, inactive, archived


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    delivery_mode: Optional[str] = None
    fee: Optional[Decimal] = None
    status: Optional[str] = None


class ServiceRead(ServiceBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    category: Optional[ServiceCategoryRead] = None
    created_by: Optional[StaffSummary] = None

    model_config = ConfigDict(from_attributes=True)
