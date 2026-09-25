"""Course and CourseCategory Pydantic schemas."""

from datetime import date, datetime
from decimal import Decimal
import uuid
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.company import StaffSummary


class CourseCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True


class CourseCategoryCreate(CourseCategoryBase):
    pass


class CourseCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class CourseCategoryRead(CourseCategoryBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CourseSummary(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    duration: Optional[str] = None
    mode: str = "online"
    fee: Decimal = Decimal("0.00")
    status: str = "draft"

    model_config = ConfigDict(from_attributes=True)


class CourseBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    duration: Optional[str] = None
    mode: str = "online"  # online, offline, hybrid
    fee: Decimal = Decimal("0.00")
    status: str = "draft"  # draft, active, inactive, completed, archived
    capacity: int = 30
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    duration: Optional[str] = None
    mode: Optional[str] = None
    fee: Optional[Decimal] = None
    status: Optional[str] = None
    capacity: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class CourseRead(CourseBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    category: Optional[CourseCategoryRead] = None
    created_by: Optional[StaffSummary] = None
    enrollment_count: int = 0

    model_config = ConfigDict(from_attributes=True)
