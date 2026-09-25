"""Course and CourseCategory repositories."""

from typing import Optional, List, Tuple
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from app.models.course import Course, CourseCategory
from app.models.enrollment import Enrollment
from app.repositories.base import BaseRepository


class CourseCategoryRepository(BaseRepository[CourseCategory]):
    def __init__(self):
        super().__init__(CourseCategory)

    def search_categories(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Tuple[List[CourseCategory], int]:
        query = select(CourseCategory).where(CourseCategory.is_deleted == False)

        if is_active is not None:
            query = query.where(CourseCategory.is_active == is_active)

        if search:
            query = query.where(CourseCategory.name.ilike(f"%{search}%"))

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        results = db.scalars(query.order_by(CourseCategory.name.asc()).offset(skip).limit(limit)).all()
        return list(results), total


class CourseRepository(BaseRepository[Course]):
    def __init__(self):
        super().__init__(Course)

    def search_courses(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        mode: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Tuple[List[Tuple[Course, int]], int]:
        """Search courses and return course objects with active enrollment count."""
        # Left outer join with enrollments to count
        enrollment_subq = (
            select(
                Enrollment.course_id,
                func.count(Enrollment.id).label("enrollment_count")
            )
            .where(Enrollment.is_deleted == False)
            .group_by(Enrollment.course_id)
            .subquery()
        )

        query = (
            select(
                Course,
                func.coalesce(enrollment_subq.c.enrollment_count, 0).label("enrollment_count")
            )
            .outerjoin(enrollment_subq, Course.id == enrollment_subq.c.course_id)
            .where(Course.is_deleted == False)
        )

        if category_id:
            query = query.where(Course.category_id == category_id)

        if mode:
            query = query.where(Course.mode == mode)

        if status:
            query = query.where(Course.status == status)

        if search:
            search_pat = f"%{search}%"
            query = query.where(
                or_(
                    Course.name.ilike(search_pat),
                    Course.code.ilike(search_pat),
                    Course.short_description.ilike(search_pat),
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        results = db.execute(
            query.order_by(Course.created_at.desc()).offset(skip).limit(limit)
        ).all()

        return [(row[0], int(row[1])) for row in results], total


course_category_repo = CourseCategoryRepository()
course_repo = CourseRepository()
