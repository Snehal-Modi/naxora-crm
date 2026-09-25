"""Course and Course Category management endpoints."""

from typing import Optional, List
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundError, BadRequestError
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.models.course import Course, CourseCategory
from app.repositories.course_repo import course_repo, course_category_repo
from app.repositories.enrollment_repo import enrollment_repo
from app.schemas.course import (
    CourseCategoryRead, CourseCategoryCreate, CourseCategoryUpdate,
    CourseRead, CourseCreate, CourseUpdate
)
from app.schemas.enrollment import EnrollmentRead
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


# =========================================================================
# Course Categories
# =========================================================================

@router.get("/categories", response_model=PaginatedResponse[CourseCategoryRead], dependencies=[Depends(require_permission("courses:view"))])
def list_course_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    """List course categories with optional search and active status filter."""
    categories, total = course_category_repo.search_categories(
        db=db, skip=skip, limit=limit, search=search, is_active=is_active
    )
    total_pages = (total + limit - 1) // limit if total > 0 else 0
    page = (skip // limit) + 1

    return PaginatedResponse(
        items=categories,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.post("/categories", response_model=CourseCategoryRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("course_categories:create"))])
def create_course_category(
    payload: CourseCategoryCreate,
    db: Session = Depends(get_db),
):
    """Create a new course category."""
    existing = course_category_repo.search_categories(db=db, search=payload.name)
    if any(c.name.lower() == payload.name.lower() for c in existing[0]):
        raise BadRequestError(f"Course category with name '{payload.name}' already exists.")

    category = CourseCategory(**payload.model_dump())
    return course_category_repo.create(db=db, obj=category)


@router.put("/categories/{id}", response_model=CourseCategoryRead, dependencies=[Depends(require_permission("course_categories:edit"))])
def update_course_category(
    id: uuid.UUID,
    payload: CourseCategoryUpdate,
    db: Session = Depends(get_db),
):
    """Update a course category."""
    category = course_category_repo.get_by_id(db=db, id=id)
    if not category:
        raise NotFoundError("Course category not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(category, field, val)

    return course_category_repo.update(db=db, obj=category)


@router.delete("/categories/{id}", response_model=MessageResponse, dependencies=[Depends(require_permission("course_categories:archive"))])
def delete_course_category(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Archive / soft delete a course category."""
    category = course_category_repo.get_by_id(db=db, id=id)
    if not category:
        raise NotFoundError("Course category not found.")

    course_category_repo.soft_delete(db=db, obj=category)
    return MessageResponse(message="Course category archived successfully.")


# =========================================================================
# Courses
# =========================================================================

@router.get("", response_model=PaginatedResponse[CourseRead], dependencies=[Depends(require_permission("courses:view"))])
def list_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    category_id: Optional[uuid.UUID] = Query(None),
    mode: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List courses with filters for search, category, delivery mode, and status."""
    courses_with_counts, total = course_repo.search_courses(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        category_id=category_id,
        mode=mode,
        status=status,
    )

    items = []
    for course, count in courses_with_counts:
        course_read = CourseRead.model_validate(course)
        course_read.enrollment_count = count
        items.append(course_read)

    total_pages = (total + limit - 1) // limit if total > 0 else 0
    page = (skip // limit) + 1

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("courses:create"))])
def create_course(
    payload: CourseCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create a new course."""
    existing, _ = course_repo.search_courses(db=db, search=payload.code)
    if any(c.code.lower() == payload.code.lower() for c, _ in existing):
        raise BadRequestError(f"Course code '{payload.code}' is already registered.")

    course = Course(**payload.model_dump(), created_by_id=current_user.id)
    created = course_repo.create(db=db, obj=course)
    course_read = CourseRead.model_validate(created)
    course_read.enrollment_count = 0
    return course_read


@router.get("/{id}", response_model=CourseRead, dependencies=[Depends(require_permission("courses:view"))])
def get_course(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Get single course by ID."""
    course = course_repo.get_by_id(db=db, id=id)
    if not course:
        raise NotFoundError("Course not found.")

    enrollments = enrollment_repo.get_course_enrollments(db=db, course_id=id)
    course_read = CourseRead.model_validate(course)
    course_read.enrollment_count = len(enrollments)
    return course_read


@router.get("/{id}/enrollments", response_model=List[EnrollmentRead], dependencies=[Depends(require_permission("courses:view"))])
def get_course_enrollments(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Get all candidates enrolled in a specific course."""
    course = course_repo.get_by_id(db=db, id=id)
    if not course:
        raise NotFoundError("Course not found.")

    enrollments = enrollment_repo.get_course_enrollments(db=db, course_id=id)
    return enrollments


@router.put("/{id}", response_model=CourseRead, dependencies=[Depends(require_permission("courses:edit"))])
def update_course(
    id: uuid.UUID,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
):
    """Update course details."""
    course = course_repo.get_by_id(db=db, id=id)
    if not course:
        raise NotFoundError("Course not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(course, field, val)

    updated = course_repo.update(db=db, obj=course)
    enrollments = enrollment_repo.get_course_enrollments(db=db, course_id=id)
    course_read = CourseRead.model_validate(updated)
    course_read.enrollment_count = len(enrollments)
    return course_read


@router.delete("/{id}", response_model=MessageResponse, dependencies=[Depends(require_permission("courses:archive"))])
def delete_course(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Archive a course."""
    course = course_repo.get_by_id(db=db, id=id)
    if not course:
        raise NotFoundError("Course not found.")

    course_repo.soft_delete(db=db, obj=course)
    return MessageResponse(message="Course archived successfully.")
