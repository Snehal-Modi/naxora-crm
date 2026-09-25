"""JobRequirement and CandidateJobMatch DTO schemas."""

from datetime import date, datetime
from decimal import Decimal
import uuid
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.company import StaffSummary, CompanyRead, ContactRead
from app.schemas.candidate import CandidateRead


class CandidateJobMatchBase(BaseModel):
    candidate_id: uuid.UUID
    job_id: Optional[uuid.UUID] = None
    status: str = "submitted"  # submitted, screening, interview_scheduled, offered, placed, rejected
    notes: Optional[str] = None
    interview_date: Optional[datetime] = None
    result: Optional[str] = None
    placement_status: Optional[str] = None


class CandidateJobMatchCreate(CandidateJobMatchBase):
    pass


class CandidateJobMatchUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    interview_date: Optional[datetime] = None
    result: Optional[str] = None
    placement_status: Optional[str] = None


class CandidateJobMatchRead(CandidateJobMatchBase):
    id: uuid.UUID
    submitted_date: datetime
    created_at: datetime
    candidate: Optional[CandidateRead] = None

    model_config = ConfigDict(from_attributes=True)


class JobRequirementBase(BaseModel):
    job_title: str
    company_id: uuid.UUID
    contact_id: Optional[uuid.UUID] = None
    description: Optional[str] = None
    required_skills: Optional[str] = None
    experience_min_years: Decimal = Decimal("0.0")
    experience_max_years: Decimal = Decimal("0.0")
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    location: Optional[str] = None
    employment_type: str = "full_time"
    vacancies: int = 1
    status: str = "open"  # draft, open, on_hold, closed
    priority: str = "medium"  # low, medium, high, urgent
    assigned_staff_id: Optional[uuid.UUID] = None
    opened_date: Optional[date] = None
    closing_date: Optional[date] = None
    notes: Optional[str] = None


class JobRequirementCreate(JobRequirementBase):
    pass


class JobRequirementUpdate(BaseModel):
    job_title: Optional[str] = None
    company_id: Optional[uuid.UUID] = None
    contact_id: Optional[uuid.UUID] = None
    description: Optional[str] = None
    required_skills: Optional[str] = None
    experience_min_years: Optional[Decimal] = None
    experience_max_years: Optional[Decimal] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    vacancies: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_staff_id: Optional[uuid.UUID] = None
    opened_date: Optional[date] = None
    closing_date: Optional[date] = None
    notes: Optional[str] = None


class JobRequirementRead(JobRequirementBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    company: Optional[CompanyRead] = None
    contact: Optional[ContactRead] = None
    assigned_staff: Optional[StaffSummary] = None
    candidate_matches: List[CandidateJobMatchRead] = []

    model_config = ConfigDict(from_attributes=True)
