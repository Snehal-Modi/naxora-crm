"""Candidate DTO schemas."""

from datetime import date, datetime
from decimal import Decimal
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr
from app.schemas.company import StaffSummary


class CandidateBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    alternate_phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    current_location: Optional[str] = None
    highest_education: Optional[str] = None
    experience_years: Decimal = Decimal("0.0")
    current_job_title: Optional[str] = None
    current_company: Optional[str] = None
    expected_salary: Optional[Decimal] = None
    notice_period: Optional[str] = None
    skills: Optional[str] = None
    preferred_job_title: Optional[str] = None
    preferred_location: Optional[str] = None
    employment_status: str = "employed"
    availability_status: str = "available"
    source: str = "manual"
    status: str = "active"  # active, placed, in_process, archived
    assigned_staff_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    current_location: Optional[str] = None
    highest_education: Optional[str] = None
    experience_years: Optional[Decimal] = None
    current_job_title: Optional[str] = None
    current_company: Optional[str] = None
    expected_salary: Optional[Decimal] = None
    notice_period: Optional[str] = None
    skills: Optional[str] = None
    preferred_job_title: Optional[str] = None
    preferred_location: Optional[str] = None
    employment_status: Optional[str] = None
    availability_status: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    assigned_staff_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class CandidateRead(CandidateBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    assigned_staff: Optional[StaffSummary] = None

    model_config = ConfigDict(from_attributes=True)

