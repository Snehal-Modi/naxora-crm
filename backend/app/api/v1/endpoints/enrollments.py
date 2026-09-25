"""Course enrollment management endpoints."""

from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundError, BadRequestError
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.models.enrollment import Enrollment
from app.repositories.enrollment_repo import enrollment_repo
from app.repositories.candidate_repo import candidate_repo
from app.repositories.course_repo import course_repo
from app.schemas.enrollment import (
    EnrollmentRead, EnrollmentCreate, EnrollmentUpdate, EnrollmentProgressUpdate
)
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[EnrollmentRead], dependencies=[Depends(require_permission("enrollments:view"))])
def list_enrollments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    candidate_id: Optional[uuid.UUID] = Query(None),
    course_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List candidate enrollments with filters."""
    enrollments, total = enrollment_repo.search_enrollments(
        db=db,
        skip=skip,
        limit=limit,
        candidate_id=candidate_id,
        course_id=course_id,
        status=status,
        payment_status=payment_status,
        search=search,
    )
    total_pages = (total + limit - 1) // limit if total > 0 else 0
    page = (skip // limit) + 1

    return PaginatedResponse(
        items=enrollments,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.post("", response_model=EnrollmentRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("enrollments:create"))])
def create_enrollment(
    payload: EnrollmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Enroll a candidate into a course."""
    candidate = candidate_repo.get_by_id(db=db, id=payload.candidate_id)
    if not candidate:
        raise NotFoundError("Candidate not found.")

    course = course_repo.get_by_id(db=db, id=payload.course_id)
    if not course:
        raise NotFoundError("Course not found.")

    if payload.progress_percentage < 0 or payload.progress_percentage > 100:
        raise BadRequestError("Progress percentage must be between 0 and 100.")

    enrollment = Enrollment(**payload.model_dump(), created_by_id=current_user.id)
    return enrollment_repo.create(db=db, obj=enrollment)


@router.get("/{id}", response_model=EnrollmentRead, dependencies=[Depends(require_permission("enrollments:view"))])
def get_enrollment(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Get single enrollment record."""
    enrollment = enrollment_repo.get_by_id(db=db, id=id)
    if not enrollment:
        raise NotFoundError("Enrollment record not found.")
    return enrollment


@router.put("/{id}", response_model=EnrollmentRead, dependencies=[Depends(require_permission("enrollments:edit"))])
def update_enrollment(
    id: uuid.UUID,
    payload: EnrollmentUpdate,
    db: Session = Depends(get_db),
):
    """Update enrollment details."""
    enrollment = enrollment_repo.get_by_id(db=db, id=id)
    if not enrollment:
        raise NotFoundError("Enrollment record not found.")

    update_data = payload.model_dump(exclude_unset=True)
    if "progress_percentage" in update_data and update_data["progress_percentage"] is not None:
        if update_data["progress_percentage"] < 0 or update_data["progress_percentage"] > 100:
            raise BadRequestError("Progress percentage must be between 0 and 100.")

    for field, val in update_data.items():
        setattr(enrollment, field, val)

    return enrollment_repo.update(db=db, obj=enrollment)


@router.patch("/{id}/progress", response_model=EnrollmentRead, dependencies=[Depends(require_permission("enrollments:edit"))])
def update_enrollment_progress(
    id: uuid.UUID,
    payload: EnrollmentProgressUpdate,
    db: Session = Depends(get_db),
):
    """Fast updater for enrollment syllabus progress percentage (0-100%)."""
    enrollment = enrollment_repo.get_by_id(db=db, id=id)
    if not enrollment:
        raise NotFoundError("Enrollment record not found.")

    if payload.progress_percentage < 0 or payload.progress_percentage > 100:
        raise BadRequestError("Progress percentage must be between 0 and 100.")

    enrollment.progress_percentage = payload.progress_percentage
    if payload.status:
        enrollment.status = payload.status
    elif payload.progress_percentage == 100 and enrollment.status != "completed":
        enrollment.status = "completed"

    if payload.completion_date:
        enrollment.completion_date = payload.completion_date

    if payload.notes:
        enrollment.notes = payload.notes

    return enrollment_repo.update(db=db, obj=enrollment)


@router.delete("/{id}", response_model=MessageResponse, dependencies=[Depends(require_permission("enrollments:archive"))])
def delete_enrollment(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Archive / cancel an enrollment."""
    enrollment = enrollment_repo.get_by_id(db=db, id=id)
    if not enrollment:
        raise NotFoundError("Enrollment record not found.")

    enrollment_repo.soft_delete(db=db, obj=enrollment)
    return MessageResponse(message="Enrollment archived successfully.")
