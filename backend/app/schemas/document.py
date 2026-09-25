"""CandidateDocument Pydantic schemas."""

from datetime import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.company import StaffSummary


class DocumentBase(BaseModel):
    candidate_id: uuid.UUID
    title: str
    document_type: str = "resume"
    notes: Optional[str] = None
    is_verified: bool = False


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    document_type: Optional[str] = None
    is_verified: Optional[bool] = None
    notes: Optional[str] = None


class DocumentRead(DocumentBase):
    id: uuid.UUID
    file_name: str
    file_size: int
    mime_type: str
    created_at: datetime
    updated_at: datetime
    uploaded_by: Optional[StaffSummary] = None

    model_config = ConfigDict(from_attributes=True)
