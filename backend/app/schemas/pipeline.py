"""Pipeline and PipelineStage DTO schemas."""

import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class PipelineStageBase(BaseModel):
    name: str
    stage_order: int
    color: str = "#3B82F6"
    is_active: bool = True


class PipelineStageCreate(PipelineStageBase):
    pipeline_id: Optional[uuid.UUID] = None


class PipelineStageRead(PipelineStageBase):
    id: uuid.UUID
    pipeline_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PipelineBase(BaseModel):
    name: str
    lead_type: str  # candidate, employer, course, service
    is_default: bool = False


class PipelineCreate(PipelineBase):
    stages: Optional[List[PipelineStageBase]] = None


class PipelineRead(PipelineBase):
    id: uuid.UUID
    created_at: datetime
    stages: List[PipelineStageRead] = []

    model_config = ConfigDict(from_attributes=True)

