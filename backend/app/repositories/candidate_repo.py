"""Candidate repository for queries and scoping."""

from typing import Optional, List, Tuple
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from app.models.candidate import Candidate
from app.repositories.base import BaseRepository


class CandidateRepository(BaseRepository[Candidate]):
    def __init__(self):
        super().__init__(Candidate)

    def search_candidates(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        status: Optional[str] = None,
        location: Optional[str] = None,
        assigned_staff_id: Optional[uuid.UUID] = None,
        scoped_user_id: Optional[uuid.UUID] = None,
    ) -> Tuple[List[Candidate], int]:
        query = select(Candidate).where(Candidate.is_deleted == False)

        # Scoping rule: if scoped_user_id is passed (staff without all-access), filter by assigned staff
        if scoped_user_id:
            query = query.where(
                or_(
                    Candidate.assigned_staff_id == scoped_user_id,
                    Candidate.assigned_staff_id.is_(None)
                )
            )
        elif assigned_staff_id:
            query = query.where(Candidate.assigned_staff_id == assigned_staff_id)

        if status:
            query = query.where(Candidate.status == status)

        if location:
            query = query.where(
                or_(
                    Candidate.city.ilike(f"%{location}%"),
                    Candidate.current_location.ilike(f"%{location}%"),
                    Candidate.state.ilike(f"%{location}%")
                )
            )

        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Candidate.first_name.ilike(search_pattern),
                    Candidate.last_name.ilike(search_pattern),
                    Candidate.email.ilike(search_pattern),
                    Candidate.phone.ilike(search_pattern),
                    Candidate.skills.ilike(search_pattern),
                    Candidate.current_job_title.ilike(search_pattern)
                )
            )

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        # Execute paginated query ordered by updated_at descending
        results = db.scalars(query.order_by(Candidate.updated_at.desc()).offset(skip).limit(limit)).all()
        return list(results), total


candidate_repo = CandidateRepository()

