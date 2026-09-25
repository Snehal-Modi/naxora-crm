"""Note DTO schemas."""

from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.company import StaffSummary


class NoteBase(BaseModel):
    content: str
    related_lead_id: Optional[uuid.UUID] = None
    related_candidate_id: Optional[uuid.UUID] = None
    related_company_id: Optional[uuid.UUID] = None
    related_job_id: Optional[uuid.UUID] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    content: str


class NoteRead(NoteBase):
    id: uuid.UUID
    author_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    author: Optional[StaffSummary] = None

    model_config = ConfigDict(from_attributes=True)

