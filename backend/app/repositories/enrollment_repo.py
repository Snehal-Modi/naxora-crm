"""Enrollment repository."""

from typing import Optional, List, Tuple
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from app.models.enrollment import Enrollment
from app.models.candidate import Candidate
from app.models.course import Course
from app.repositories.base import BaseRepository


class EnrollmentRepository(BaseRepository[Enrollment]):
    def __init__(self):
        super().__init__(Enrollment)

    def search_enrollments(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        candidate_id: Optional[uuid.UUID] = None,
        course_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        payment_status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Enrollment], int]:
        query = select(Enrollment).where(Enrollment.is_deleted == False)

        if candidate_id:
            query = query.where(Enrollment.candidate_id == candidate_id)

        if course_id:
            query = query.where(Enrollment.course_id == course_id)

        if status:
            query = query.where(Enrollment.status == status)

        if payment_status:
            query = query.where(Enrollment.payment_status == payment_status)

        if search:
            search_pat = f"%{search}%"
            # Join candidate and course for search
            query = (
                query.join(Candidate, Enrollment.candidate_id == Candidate.id)
                .join(Course, Enrollment.course_id == Course.id)
                .where(
                    or_(
                        Candidate.first_name.ilike(search_pat),
                        Candidate.last_name.ilike(search_pat),
                        Candidate.email.ilike(search_pat),
                        Course.name.ilike(search_pat),
                        Course.code.ilike(search_pat),
                    )
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        results = db.scalars(query.order_by(Enrollment.enrollment_date.desc()).offset(skip).limit(limit)).all()
        return list(results), total

    def get_candidate_enrollments(self, db: Session, candidate_id: uuid.UUID) -> List[Enrollment]:
        query = (
            select(Enrollment)
            .where(Enrollment.candidate_id == candidate_id, Enrollment.is_deleted == False)
            .order_by(Enrollment.enrollment_date.desc())
        )
        return list(db.scalars(query).all())

    def get_course_enrollments(self, db: Session, course_id: uuid.UUID) -> List[Enrollment]:
        query = (
            select(Enrollment)
            .where(Enrollment.course_id == course_id, Enrollment.is_deleted == False)
            .order_by(Enrollment.enrollment_date.desc())
        )
        return list(db.scalars(query).all())


enrollment_repo = EnrollmentRepository()
