"""Placement Pydantic schemas."""

from datetime import date, datetime
from decimal import Decimal
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.company import StaffSummary, CompanyRead
from app.schemas.candidate import CandidateRead
from app.schemas.job import JobRequirementRead


class PlacementBase(BaseModel):
    candidate_id: uuid.UUID
    company_id: uuid.UUID
    job_requirement_id: Optional[uuid.UUID] = None
    status: str = "interview_scheduled"
    # applied, screening, interview_scheduled, interview_completed, offered, joined, rejected, backed_out
    interview_date: Optional[date] = None
    offer_date: Optional[date] = None
    joining_date: Optional[date] = None
    salary_offered: Optional[Decimal] = None
    placement_fee: Optional[Decimal] = None
    notes: Optional[str] = None


class PlacementCreate(PlacementBase):
    pass


class PlacementUpdate(BaseModel):
    candidate_id: Optional[uuid.UUID] = None
    company_id: Optional[uuid.UUID] = None
    job_requirement_id: Optional[uuid.UUID] = None
    status: Optional[str] = None
    interview_date: Optional[date] = None
    offer_date: Optional[date] = None
    joining_date: Optional[date] = None
    salary_offered: Optional[Decimal] = None
    placement_fee: Optional[Decimal] = None
    notes: Optional[str] = None


class PlacementRead(PlacementBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    candidate: Optional[CandidateRead] = None
    company: Optional[CompanyRead] = None
    job_requirement: Optional[JobRequirementRead] = None
    created_by: Optional[StaffSummary] = None

    model_config = ConfigDict(from_attributes=True)
