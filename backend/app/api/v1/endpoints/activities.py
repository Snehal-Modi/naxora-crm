"""Activity timeline endpoints."""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.repositories.activity_repo import activity_repo
from app.schemas.activity import ActivityRead, ActivityCreate

router = APIRouter()


@router.get("", response_model=List[ActivityRead], dependencies=[Depends(require_permission("activities:view"))])
def list_activities(
    limit: int = Query(50, ge=1, le=100),
    related_candidate_id: Optional[uuid.UUID] = Query(None),
    related_company_id: Optional[uuid.UUID] = Query(None),
    related_lead_id: Optional[uuid.UUID] = Query(None),
    related_job_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve chronological activity stream for any entity or overall CRM."""
    return activity_repo.get_timeline(
        db=db,
        related_candidate_id=related_candidate_id,
        related_company_id=related_company_id,
        related_lead_id=related_lead_id,
        related_job_id=related_job_id,
        limit=limit
    )


@router.post("", response_model=ActivityRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("activities:create"))])
def log_activity(
    payload: ActivityCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Manually log a call, meeting, note, or custom CRM event."""
    return activity_repo.log_activity(
        db=db,
        activity_type=payload.activity_type,
        title=payload.title,
        description=payload.description,
        user_id=current_user.id,
        related_candidate_id=payload.related_candidate_id,
        related_company_id=payload.related_company_id,
        related_lead_id=payload.related_lead_id,
        related_job_id=payload.related_job_id
    )

