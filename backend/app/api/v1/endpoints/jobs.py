"""Job requirements and candidate matching endpoints."""

from datetime import datetime, timezone
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.models.job import JobRequirement, CandidateJobMatch
from app.models.candidate import Candidate
from app.repositories.job_repo import job_repo
from app.repositories.activity_repo import activity_repo
from app.schemas.job import (
    JobRequirementRead, JobRequirementCreate, JobRequirementUpdate,
    CandidateJobMatchRead, CandidateJobMatchCreate, CandidateJobMatchUpdate
)
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[JobRequirementRead], dependencies=[Depends(require_permission("jobs:view"))])
def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    company_id: Optional[uuid.UUID] = Query(None),
    assigned_staff_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List employer job requirements."""
    scoped_user_id = None if (current_user.is_superuser or current_user.has_permission("jobs:view_all")) else current_user.id

    jobs, total = job_repo.search_jobs(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        company_id=company_id,
        assigned_staff_id=assigned_staff_id,
        scoped_user_id=scoped_user_id
    )

    total_pages = (total + limit - 1) // limit if total > 0 else 0
    page = (skip // limit) + 1

    return PaginatedResponse(
        items=jobs,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.post("", response_model=JobRequirementRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("jobs:create"))])
def create_job(
    payload: JobRequirementCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Post a new job requirement."""
    data = payload.model_dump()
    if not data.get("assigned_staff_id") and not current_user.is_superuser:
        data["assigned_staff_id"] = current_user.id

    job = JobRequirement(**data)
    created = job_repo.create(db, job)

    activity_repo.log_activity(
        db=db,
        activity_type="status_change",
        title=f"Job Requirement Posted: {created.job_title}",
        description=f"Status: {created.status}, Vacancies: {created.vacancies}",
        user_id=current_user.id,
        related_job_id=created.id,
        related_company_id=created.company_id
    )

    return created


@router.get("/{id}", response_model=JobRequirementRead, dependencies=[Depends(require_permission("jobs:view"))])
def get_job(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieve single job requirement details."""
    job = job_repo.get_by_id(db, id=id)
    if not job:
        raise NotFoundError("Job requirement not found")

    if not current_user.is_superuser and not current_user.has_permission("jobs:view_all"):
        if job.assigned_staff_id and job.assigned_staff_id != current_user.id:
            raise PermissionDeniedError("Access restricted to assigned staff")

    return job


@router.patch("/{id}", response_model=JobRequirementRead, dependencies=[Depends(require_permission("jobs:edit"))])
def update_job(
    id: uuid.UUID,
    payload: JobRequirementUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update job requirement."""
    job = job_repo.get_by_id(db, id=id)
    if not job:
        raise NotFoundError("Job requirement not found")

    if not current_user.is_superuser and not current_user.has_permission("jobs:edit_all"):
        if job.assigned_staff_id and job.assigned_staff_id != current_user.id:
            raise PermissionDeniedError("Access restricted to assigned staff")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    return job_repo.update(db, job)


@router.delete("/{id}", response_model=MessageResponse, dependencies=[Depends(require_permission("jobs:archive"))])
def archive_job(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Archive job requirement."""
    job = job_repo.get_by_id(db, id=id)
    if not job:
        raise NotFoundError("Job requirement not found")

    job_repo.soft_delete(db, job)
    return MessageResponse(message="Job requirement successfully archived")


@router.post("/{id}/matches", response_model=CandidateJobMatchRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("jobs:edit"))])
def submit_candidate_to_job(
    id: uuid.UUID,
    payload: CandidateJobMatchCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit / link a candidate to a job requirement."""
    job = job_repo.get_by_id(db, id=id)
    if not job:
        raise NotFoundError("Job requirement not found")

    candidate = db.get(Candidate, payload.candidate_id)
    if not candidate:
        raise NotFoundError("Candidate not found")

    match = CandidateJobMatch(
        candidate_id=payload.candidate_id,
        job_id=id,
        status=payload.status,
        notes=payload.notes,
        submitted_date=datetime.now(timezone.utc)
    )
    created_match = job_repo.add_match(db, match)

    activity_repo.log_activity(
        db=db,
        activity_type="interview",
        title=f"Candidate Submitted: {candidate.full_name} for {job.job_title}",
        description=payload.notes,
        user_id=current_user.id,
        related_job_id=id,
        related_candidate_id=candidate.id,
        related_company_id=job.company_id
    )

    return created_match
