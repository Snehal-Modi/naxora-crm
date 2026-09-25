"""Activity repository for chronological timelines."""

from typing import Optional, List
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.activity import Activity
from app.repositories.base import BaseRepository


class ActivityRepository(BaseRepository[Activity]):
    def __init__(self):
        super().__init__(Activity)

    def get_timeline(
        self,
        db: Session,
        related_candidate_id: Optional[uuid.UUID] = None,
        related_company_id: Optional[uuid.UUID] = None,
        related_lead_id: Optional[uuid.UUID] = None,
        related_job_id: Optional[uuid.UUID] = None,
        limit: int = 50,
    ) -> List[Activity]:
        query = select(Activity).where(Activity.is_deleted == False)

        if related_candidate_id:
            query = query.where(Activity.related_candidate_id == related_candidate_id)
        if related_company_id:
            query = query.where(Activity.related_company_id == related_company_id)
        if related_lead_id:
            query = query.where(Activity.related_lead_id == related_lead_id)
        if related_job_id:
            query = query.where(Activity.related_job_id == related_job_id)

        query = query.order_by(Activity.created_at.desc()).limit(limit)
        return list(db.scalars(query).all())

    def log_activity(
        self,
        db: Session,
        activity_type: str,
        title: str,
        user_id: uuid.UUID,
        description: Optional[str] = None,
        related_candidate_id: Optional[uuid.UUID] = None,
        related_company_id: Optional[uuid.UUID] = None,
        related_lead_id: Optional[uuid.UUID] = None,
        related_job_id: Optional[uuid.UUID] = None,
    ) -> Activity:
        activity = Activity(
            activity_type=activity_type,
            title=title,
            description=description,
            user_id=user_id,
            related_candidate_id=related_candidate_id,
            related_company_id=related_company_id,
            related_lead_id=related_lead_id,
            related_job_id=related_job_id,
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity


activity_repo = ActivityRepository()

