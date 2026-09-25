"""Lead management and assignment endpoints."""

from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.models.lead import Lead
from app.repositories.lead_repo import lead_repo
from app.repositories.activity_repo import activity_repo
from app.repositories.user_repo import user_repo
from app.schemas.lead import (
    LeadRead, LeadCreate, LeadUpdate, LeadAssignRequest, LeadAssignmentRead
)
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[LeadRead], dependencies=[Depends(require_permission("leads:view"))])
def list_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    lead_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    stage_id: Optional[uuid.UUID] = Query(None),
    priority: Optional[str] = Query(None),
    assigned_staff_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List CRM leads with search, filtering, and staff scoping."""
    scoped_user_id = None if (current_user.is_superuser or current_user.has_permission("leads:view_all")) else current_user.id

    leads, total = lead_repo.search_leads(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        lead_type=lead_type,
        status=status,
        stage_id=stage_id,
        priority=priority,
        assigned_staff_id=assigned_staff_id,
        scoped_user_id=scoped_user_id
    )

    total_pages = (total + limit - 1) // limit if total > 0 else 0
    page = (skip // limit) + 1

    return PaginatedResponse(
        items=leads,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.post("", response_model=LeadRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("leads:create"))])
def create_lead(
    payload: LeadCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new CRM lead."""
    data = payload.model_dump()
    if not data.get("assigned_staff_id") and not current_user.is_superuser:
        data["assigned_staff_id"] = current_user.id

    lead = Lead(**data)
    created = lead_repo.create(db, lead)

    activity_repo.log_activity(
        db=db,
        activity_type="status_change",
        title=f"Lead Created: {created.title}",
        description=f"Type: {created.lead_type.capitalize()}, Priority: {created.priority}",
        user_id=current_user.id,
        related_lead_id=created.id
    )

    return created


@router.get("/{id}", response_model=LeadRead, dependencies=[Depends(require_permission("leads:view"))])
def get_lead(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieve single lead detail."""
    lead = lead_repo.get_by_id(db, id=id)
    if not lead:
        raise NotFoundError("Lead not found")

    if not current_user.is_superuser and not current_user.has_permission("leads:view_all"):
        if lead.assigned_staff_id and lead.assigned_staff_id != current_user.id:
            raise PermissionDeniedError("Access restricted to assigned staff")

    return lead


@router.patch("/{id}", response_model=LeadRead, dependencies=[Depends(require_permission("leads:edit"))])
def update_lead(
    id: uuid.UUID,
    payload: LeadUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update lead details or stage."""
    lead = lead_repo.get_by_id(db, id=id)
    if not lead:
        raise NotFoundError("Lead not found")

    if not current_user.is_superuser and not current_user.has_permission("leads:edit_all"):
        if lead.assigned_staff_id and lead.assigned_staff_id != current_user.id:
            raise PermissionDeniedError("Access restricted to assigned staff")

    old_status = lead.status
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)

    updated = lead_repo.update(db, lead)

    if "status" in update_data and update_data["status"] != old_status:
        activity_repo.log_activity(
            db=db,
            activity_type="status_change",
            title=f"Lead Status Changed: {old_status} → {updated.status}",
            user_id=current_user.id,
            related_lead_id=updated.id
        )

    return updated


@router.post("/{id}/assign", response_model=LeadRead, dependencies=[Depends(require_permission("leads:assign"))])
def assign_lead(
    id: uuid.UUID,
    payload: LeadAssignRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Assign or reassign lead to a staff member."""
    lead = lead_repo.get_by_id(db, id=id)
    if not lead:
        raise NotFoundError("Lead not found")

    assignee = user_repo.get_by_id(db, id=payload.assigned_to_id)
    if not assignee:
        raise NotFoundError("Assignee user not found")

    updated_lead = lead_repo.assign_lead(
        db=db,
        lead=lead,
        assigned_by_id=current_user.id,
        assigned_to_id=assignee.id,
        notes=payload.notes
    )

    activity_repo.log_activity(
        db=db,
        activity_type="task",
        title=f"Lead Assigned to {assignee.full_name}",
        description=payload.notes,
        user_id=current_user.id,
        related_lead_id=updated_lead.id
    )

    return updated_lead


@router.delete("/{id}", response_model=MessageResponse, dependencies=[Depends(require_permission("leads:archive"))])
def archive_lead(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Archive lead."""
    lead = lead_repo.get_by_id(db, id=id)
    if not lead:
        raise NotFoundError("Lead not found")

    lead_repo.soft_delete(db, lead)
    return MessageResponse(message="Lead successfully archived")

