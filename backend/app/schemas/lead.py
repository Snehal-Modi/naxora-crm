"""Lead and LeadAssignment DTO schemas."""

from datetime import datetime
import uuid
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr
from app.schemas.company import StaffSummary, CompanyRead
from app.schemas.candidate import CandidateRead
from app.schemas.pipeline import PipelineStageRead, PipelineRead
from app.schemas.course import CourseSummary
from app.schemas.service import ServiceSummary


class LeadAssignmentRead(BaseModel):
    id: uuid.UUID
    lead_id: uuid.UUID
    assigned_at: datetime
    notes: Optional[str] = None
    assigned_by: StaffSummary
    assigned_to: StaffSummary

    model_config = ConfigDict(from_attributes=True)


class LeadAssignRequest(BaseModel):
    assigned_to_id: uuid.UUID
    notes: Optional[str] = None


class LeadBase(BaseModel):
    title: str
    lead_type: str  # candidate, employer, course, service
    source: str = "manual"  # manual, website, import, referral, other
    status: str = "new"  # new, contacted, qualified, lost, converted
    priority: str = "medium"  # low, medium, high, urgent
    pipeline_id: Optional[uuid.UUID] = None
    stage_id: Optional[uuid.UUID] = None
    candidate_id: Optional[uuid.UUID] = None
    company_id: Optional[uuid.UUID] = None
    course_id: Optional[uuid.UUID] = None
    service_id: Optional[uuid.UUID] = None
    assigned_staff_id: Optional[uuid.UUID] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    last_contacted_at: Optional[datetime] = None
    next_follow_up_at: Optional[datetime] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    title: Optional[str] = None
    lead_type: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    pipeline_id: Optional[uuid.UUID] = None
    stage_id: Optional[uuid.UUID] = None
    candidate_id: Optional[uuid.UUID] = None
    company_id: Optional[uuid.UUID] = None
    course_id: Optional[uuid.UUID] = None
    service_id: Optional[uuid.UUID] = None
    assigned_staff_id: Optional[uuid.UUID] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    last_contacted_at: Optional[datetime] = None
    next_follow_up_at: Optional[datetime] = None


class LeadRead(LeadBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    assigned_staff: Optional[StaffSummary] = None
    stage: Optional[PipelineStageRead] = None
    pipeline: Optional[PipelineRead] = None
    candidate: Optional[CandidateRead] = None
    company: Optional[CompanyRead] = None
    course: Optional[CourseSummary] = None
    service: Optional[ServiceSummary] = None
    assignments: List[LeadAssignmentRead] = []

    model_config = ConfigDict(from_attributes=True)
