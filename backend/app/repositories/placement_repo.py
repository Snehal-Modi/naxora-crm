"""Placement repository."""

from typing import Optional, List, Tuple
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from app.models.placement import Placement
from app.models.candidate import Candidate
from app.models.company import Company
from app.repositories.base import BaseRepository


class PlacementRepository(BaseRepository[Placement]):
    def __init__(self):
        super().__init__(Placement)

    def search_placements(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        candidate_id: Optional[uuid.UUID] = None,
        company_id: Optional[uuid.UUID] = None,
        job_requirement_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Placement], int]:
        query = select(Placement).where(Placement.is_deleted == False)

        if candidate_id:
            query = query.where(Placement.candidate_id == candidate_id)

        if company_id:
            query = query.where(Placement.company_id == company_id)

        if job_requirement_id:
            query = query.where(Placement.job_requirement_id == job_requirement_id)

        if status:
            query = query.where(Placement.status == status)

        if search:
            search_pat = f"%{search}%"
            query = (
                query.join(Candidate, Placement.candidate_id == Candidate.id)
                .join(Company, Placement.company_id == Company.id)
                .where(
                    or_(
                        Candidate.first_name.ilike(search_pat),
                        Candidate.last_name.ilike(search_pat),
                        Candidate.email.ilike(search_pat),
                        Company.name.ilike(search_pat),
                    )
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        results = db.scalars(query.order_by(Placement.created_at.desc()).offset(skip).limit(limit)).all()
        return list(results), total

    def get_candidate_placements(self, db: Session, candidate_id: uuid.UUID) -> List[Placement]:
        query = (
            select(Placement)
            .where(Placement.candidate_id == candidate_id, Placement.is_deleted == False)
            .order_by(Placement.created_at.desc())
        )
        return list(db.scalars(query).all())


placement_repo = PlacementRepository()
