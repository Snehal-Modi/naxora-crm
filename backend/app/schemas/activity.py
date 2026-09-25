"""Activity DTO schemas."""

from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.company import StaffSummary


class ActivityBase(BaseModel):
    activity_type: str  # call, email, whatsapp, meeting, note, status_change, task, interview
    title: str
    description: Optional[str] = None
    related_lead_id: Optional[uuid.UUID] = None
    related_candidate_id: Optional[uuid.UUID] = None
    related_company_id: Optional[uuid.UUID] = None
    related_job_id: Optional[uuid.UUID] = None


class ActivityCreate(ActivityBase):
    pass


class ActivityRead(ActivityBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    user: Optional[StaffSummary] = None

    model_config = ConfigDict(from_attributes=True)

