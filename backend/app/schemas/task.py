"""Task DTO schemas."""

from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.company import StaffSummary


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_user_id: Optional[uuid.UUID] = None
    due_date: Optional[datetime] = None
    priority: str = "medium"  # low, medium, high, urgent
    status: str = "pending"  # pending, in_progress, completed, cancelled
    related_lead_id: Optional[uuid.UUID] = None
    related_candidate_id: Optional[uuid.UUID] = None
    related_company_id: Optional[uuid.UUID] = None
    related_job_id: Optional[uuid.UUID] = None
    reminder_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_user_id: Optional[uuid.UUID] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    related_lead_id: Optional[uuid.UUID] = None
    related_candidate_id: Optional[uuid.UUID] = None
    related_company_id: Optional[uuid.UUID] = None
    related_job_id: Optional[uuid.UUID] = None
    reminder_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class TaskRead(TaskBase):
    id: uuid.UUID
    assigned_user_id: uuid.UUID
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    assigned_user: Optional[StaffSummary] = None

    model_config = ConfigDict(from_attributes=True)

