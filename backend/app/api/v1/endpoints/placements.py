"""Placement management endpoints."""

from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.models.placement import Placement
from app.repositories.placement_repo import placement_repo
from app.repositories.candidate_repo import candidate_repo
from app.repositories.company_repo import company_repo
from app.schemas.placement import PlacementRead, PlacementCreate, PlacementUpdate
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[PlacementRead], dependencies=[Depends(require_permission("placements:view"))])
def list_placements(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    candidate_id: Optional[uuid.UUID] = Query(None),
    company_id: Optional[uuid.UUID] = Query(None),
    job_requirement_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List placement records with filters."""
    placements, total = placement_repo.search_placements(
        db=db,
        skip=skip,
        limit=limit,
        candidate_id=candidate_id,
        company_id=company_id,
        job_requirement_id=job_requirement_id,
        status=status,
        search=search,
    )
    total_pages = (total + limit - 1) // limit if total > 0 else 0
    page = (skip // limit) + 1

    return PaginatedResponse(
        items=placements,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.post("", response_model=PlacementRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("placements:create"))])
def create_placement(
    payload: PlacementCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create a new placement tracking record."""
    candidate = candidate_repo.get_by_id(db=db, id=payload.candidate_id)
    if not candidate:
        raise NotFoundError("Candidate not found.")

    company = company_repo.get_by_id(db=db, id=payload.company_id)
    if not company:
        raise NotFoundError("Company not found.")

    placement = Placement(**payload.model_dump(), created_by_id=current_user.id)
    return placement_repo.create(db=db, obj=placement)


@router.get("/{id}", response_model=PlacementRead, dependencies=[Depends(require_permission("placements:view"))])
def get_placement(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Get single placement record."""
    placement = placement_repo.get_by_id(db=db, id=id)
    if not placement:
        raise NotFoundError("Placement record not found.")
    return placement


@router.put("/{id}", response_model=PlacementRead, dependencies=[Depends(require_permission("placements:edit"))])
def update_placement(
    id: uuid.UUID,
    payload: PlacementUpdate,
    db: Session = Depends(get_db),
):
    """Update placement status, offers, and join dates."""
    placement = placement_repo.get_by_id(db=db, id=id)
    if not placement:
        raise NotFoundError("Placement record not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(placement, field, val)

    return placement_repo.update(db=db, obj=placement)


@router.delete("/{id}", response_model=MessageResponse, dependencies=[Depends(require_permission("placements:archive"))])
def delete_placement(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Archive a placement record."""
    placement = placement_repo.get_by_id(db=db, id=id)
    if not placement:
        raise NotFoundError("Placement record not found.")

    placement_repo.soft_delete(db=db, obj=placement)
    return MessageResponse(message="Placement archived successfully.")
