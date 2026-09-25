"""Enrollment Pydantic schemas."""

from datetime import date, datetime
from decimal import Decimal
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.company import StaffSummary
from app.schemas.candidate import CandidateRead
from app.schemas.course import CourseSummary


class EnrollmentBase(BaseModel):
    candidate_id: uuid.UUID
    course_id: uuid.UUID
    enrollment_date: date = Field(default_factory=date.today)
    status: str = "enrolled"  # enrolled, in_progress, completed, dropped, cancelled
    progress_percentage: int = Field(default=0, ge=0, le=100)
    fee_paid: Decimal = Decimal("0.00")
    payment_status: str = "pending"  # pending, partial, paid, refunded
    completion_date: Optional[date] = None
    certificate_issued: bool = False
    notes: Optional[str] = None


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentUpdate(BaseModel):
    status: Optional[str] = None
    progress_percentage: Optional[int] = Field(default=None, ge=0, le=100)
    fee_paid: Optional[Decimal] = None
    payment_status: Optional[str] = None
    completion_date: Optional[date] = None
    certificate_issued: Optional[bool] = None
    notes: Optional[str] = None


class EnrollmentProgressUpdate(BaseModel):
    progress_percentage: int = Field(ge=0, le=100)
    status: Optional[str] = None
    completion_date: Optional[date] = None
    notes: Optional[str] = None


class EnrollmentRead(EnrollmentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    candidate: Optional[CandidateRead] = None
    course: Optional[CourseSummary] = None
    created_by: Optional[StaffSummary] = None

    model_config = ConfigDict(from_attributes=True)
