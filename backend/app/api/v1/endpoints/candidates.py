"""Candidate management endpoints."""

from typing import Optional, List
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.models.candidate import Candidate
from app.repositories.candidate_repo import candidate_repo
from app.repositories.activity_repo import activity_repo
from app.repositories.enrollment_repo import enrollment_repo
from app.repositories.placement_repo import placement_repo
from app.schemas.candidate import CandidateRead, CandidateCreate, CandidateUpdate
from app.schemas.enrollment import EnrollmentRead
from app.schemas.placement import PlacementRead
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[CandidateRead], dependencies=[Depends(require_permission("candidates:view"))])
def list_candidates(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    assigned_staff_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List candidates with search, filtering, and staff scoping."""
    scoped_user_id = None if (current_user.is_superuser or current_user.has_permission("candidates:view_all")) else current_user.id

    candidates, total = candidate_repo.search_candidates(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        location=location,
        assigned_staff_id=assigned_staff_id,
        scoped_user_id=scoped_user_id
    )

    total_pages = (total + limit - 1) // limit if total > 0 else 0
    page = (skip // limit) + 1

    return PaginatedResponse(
        items=candidates,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.post("", response_model=CandidateRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("candidates:create"))])
def create_candidate(
    payload: CandidateCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new candidate record."""
    data = payload.model_dump()
    if not data.get("assigned_staff_id") and not current_user.is_superuser:
        data["assigned_staff_id"] = current_user.id

    candidate = Candidate(**data)
    created = candidate_repo.create(db, candidate)

    # Log creation activity
    activity_repo.log_activity(
        db=db,
        activity_type="status_change",
        title=f"Candidate Profile Created: {created.full_name}",
        description=f"Created with status: {created.status}",
        user_id=current_user.id,
        related_candidate_id=created.id
    )

    return created


@router.get("/{id}", response_model=CandidateRead, dependencies=[Depends(require_permission("candidates:view"))])
def get_candidate(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieve single candidate profile."""
    candidate = candidate_repo.get_by_id(db, id=id)
    if not candidate:
        raise NotFoundError("Candidate not found")

    # Scoping check
    if not current_user.is_superuser and not current_user.has_permission("candidates:view_all"):
        if candidate.assigned_staff_id and candidate.assigned_staff_id != current_user.id:
            raise PermissionDeniedError("Access restricted to assigned staff")

    return candidate


@router.patch("/{id}", response_model=CandidateRead, dependencies=[Depends(require_permission("candidates:edit"))])
def update_candidate(
    id: uuid.UUID,
    payload: CandidateUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update candidate details."""
    candidate = candidate_repo.get_by_id(db, id=id)
    if not candidate:
        raise NotFoundError("Candidate not found")

    if not current_user.is_superuser and not current_user.has_permission("candidates:edit_all"):
        if candidate.assigned_staff_id and candidate.assigned_staff_id != current_user.id:
            raise PermissionDeniedError("Access restricted to assigned staff")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(candidate, field, value)

    updated = candidate_repo.update(db, candidate)
    return updated


@router.delete("/{id}", response_model=MessageResponse, dependencies=[Depends(require_permission("candidates:archive"))])
def archive_candidate(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Archive or soft delete candidate."""
    candidate = candidate_repo.get_by_id(db, id=id)
    if not candidate:
        raise NotFoundError("Candidate not found")

    candidate_repo.soft_delete(db, candidate)
    return MessageResponse(message="Candidate successfully archived")


@router.get("/{id}/enrollments", response_model=List[EnrollmentRead], dependencies=[Depends(require_permission("candidates:view"))])
def get_candidate_enrollments(
    id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """List all course enrollments for this candidate."""
    candidate = candidate_repo.get_by_id(db, id=id)
    if not candidate:
        raise NotFoundError("Candidate not found")
    return enrollment_repo.get_candidate_enrollments(db=db, candidate_id=id)


@router.get("/{id}/placements", response_model=List[PlacementRead], dependencies=[Depends(require_permission("candidates:view"))])
def get_candidate_placements(
    id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """List all placement records for this candidate."""
    candidate = candidate_repo.get_by_id(db, id=id)
    if not candidate:
        raise NotFoundError("Candidate not found")
    return placement_repo.get_candidate_placements(db=db, candidate_id=id)
