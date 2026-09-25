"""Pipeline management endpoints."""

from typing import List
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.dependencies.permissions import require_permission
from app.models.pipeline import Pipeline, PipelineStage
from app.schemas.pipeline import PipelineRead, PipelineCreate, PipelineStageRead, PipelineStageCreate

router = APIRouter()


@router.get("", response_model=List[PipelineRead], dependencies=[Depends(require_permission("pipelines:view"))])
def list_pipelines(db: Session = Depends(get_db)):
    """List all CRM pipelines and their ordered stages."""
    pipelines = db.scalars(select(Pipeline).where(Pipeline.is_deleted == False)).all()
    return list(pipelines)


@router.get("/{id}", response_model=PipelineRead, dependencies=[Depends(require_permission("pipelines:view"))])
def get_pipeline(id: uuid.UUID, db: Session = Depends(get_db)):
    """Retrieve single pipeline by ID."""
    pipeline = db.scalar(select(Pipeline).where(Pipeline.id == id, Pipeline.is_deleted == False))
    if not pipeline:
        raise NotFoundError("Pipeline not found")
    return pipeline


@router.post("", response_model=PipelineRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("pipelines:manage"))])
def create_pipeline(payload: PipelineCreate, db: Session = Depends(get_db)):
    """Create a new CRM pipeline and initial stages."""
    pipeline = Pipeline(
        name=payload.name,
        lead_type=payload.lead_type,
        is_default=payload.is_default
    )
    db.add(pipeline)
    db.flush()

    if payload.stages:
        for stage_data in payload.stages:
            stage = PipelineStage(
                pipeline_id=pipeline.id,
                name=stage_data.name,
                stage_order=stage_data.stage_order,
                color=stage_data.color,
                is_active=stage_data.is_active
            )
            db.add(stage)

    db.commit()
    db.refresh(pipeline)
    return pipeline

