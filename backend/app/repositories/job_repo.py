"""JobRequirement and CandidateJobMatch repository."""

from datetime import datetime
from typing import Optional, List, Tuple
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from app.models.job import JobRequirement, CandidateJobMatch
from app.repositories.base import BaseRepository


class JobRepository(BaseRepository[JobRequirement]):
    def __init__(self):
        super().__init__(JobRequirement)

    def search_jobs(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        status: Optional[str] = None,
        company_id: Optional[uuid.UUID] = None,
        assigned_staff_id: Optional[uuid.UUID] = None,
        scoped_user_id: Optional[uuid.UUID] = None,
    ) -> Tuple[List[JobRequirement], int]:
        query = select(JobRequirement).where(JobRequirement.is_deleted == False)

        if scoped_user_id:
            query = query.where(
                or_(
                    JobRequirement.assigned_staff_id == scoped_user_id,
                    JobRequirement.assigned_staff_id.is_(None)
                )
            )
        elif assigned_staff_id:
            query = query.where(JobRequirement.assigned_staff_id == assigned_staff_id)

        if status:
            query = query.where(JobRequirement.status == status)

        if company_id:
            query = query.where(JobRequirement.company_id == company_id)

        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    JobRequirement.job_title.ilike(search_pattern),
                    JobRequirement.location.ilike(search_pattern),
                    JobRequirement.required_skills.ilike(search_pattern)
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        results = db.scalars(query.order_by(JobRequirement.updated_at.desc()).offset(skip).limit(limit)).all()
        return list(results), total

    def add_match(self, db: Session, match: CandidateJobMatch) -> CandidateJobMatch:
        db.add(match)
        db.commit()
        db.refresh(match)
        return match

    def get_match(self, db: Session, match_id: uuid.UUID) -> Optional[CandidateJobMatch]:
        query = select(CandidateJobMatch).where(CandidateJobMatch.id == match_id, CandidateJobMatch.is_deleted == False)
        return db.scalar(query)


job_repo = JobRepository()

