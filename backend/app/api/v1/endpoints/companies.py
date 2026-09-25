"""Company and Contact management endpoints."""

from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.models.company import Company, Contact
from app.repositories.company_repo import company_repo
from app.repositories.activity_repo import activity_repo
from app.schemas.company import (
    CompanyRead, CompanyCreate, CompanyUpdate,
    ContactRead, ContactCreate, ContactUpdate
)
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[CompanyRead], dependencies=[Depends(require_permission("companies:view"))])
def list_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    assigned_staff_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List employers/companies with search, filtering, and staff scoping."""
    scoped_user_id = None if (current_user.is_superuser or current_user.has_permission("companies:view_all")) else current_user.id

    companies, total = company_repo.search_companies(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        industry=industry,
        assigned_staff_id=assigned_staff_id,
        scoped_user_id=scoped_user_id
    )

    total_pages = (total + limit - 1) // limit if total > 0 else 0
    page = (skip // limit) + 1

    return PaginatedResponse(
        items=companies,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.post("", response_model=CompanyRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("companies:create"))])
def create_company(
    payload: CompanyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Register a new employer/company profile."""
    data = payload.model_dump()
    if not data.get("assigned_staff_id") and not current_user.is_superuser:
        data["assigned_staff_id"] = current_user.id

    company = Company(**data)
    created = company_repo.create(db, company)

    activity_repo.log_activity(
        db=db,
        activity_type="status_change",
        title=f"Company Registered: {created.name}",
        description=f"Industry: {created.industry or 'N/A'}, Status: {created.status}",
        user_id=current_user.id,
        related_company_id=created.id
    )

    return created


@router.get("/{id}", response_model=CompanyRead, dependencies=[Depends(require_permission("companies:view"))])
def get_company(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieve single company details and contacts."""
    company = company_repo.get_by_id(db, id=id)
    if not company:
        raise NotFoundError("Company not found")

    if not current_user.is_superuser and not current_user.has_permission("companies:view_all"):
        if company.assigned_staff_id and company.assigned_staff_id != current_user.id:
            raise PermissionDeniedError("Access restricted to assigned staff")

    return company


@router.patch("/{id}", response_model=CompanyRead, dependencies=[Depends(require_permission("companies:edit"))])
def update_company(
    id: uuid.UUID,
    payload: CompanyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update company details."""
    company = company_repo.get_by_id(db, id=id)
    if not company:
        raise NotFoundError("Company not found")

    if not current_user.is_superuser and not current_user.has_permission("companies:edit_all"):
        if company.assigned_staff_id and company.assigned_staff_id != current_user.id:
            raise PermissionDeniedError("Access restricted to assigned staff")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    return company_repo.update(db, company)


@router.delete("/{id}", response_model=MessageResponse, dependencies=[Depends(require_permission("companies:archive"))])
def archive_company(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Archive employer company."""
    company = company_repo.get_by_id(db, id=id)
    if not company:
        raise NotFoundError("Company not found")

    company_repo.soft_delete(db, company)
    return MessageResponse(message="Company successfully archived")


@router.post("/{id}/contacts", response_model=ContactRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("contacts:create"))])
def add_company_contact(
    id: uuid.UUID,
    payload: ContactCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add a contact person to an employer company."""
    company = company_repo.get_by_id(db, id=id)
    if not company:
        raise NotFoundError("Company not found")

    contact_data = payload.model_dump()
    contact_data["company_id"] = id
    contact = Contact(**contact_data)
    created_contact = company_repo.add_contact(db, contact)

    activity_repo.log_activity(
        db=db,
        activity_type="note",
        title=f"Contact Added: {created_contact.full_name}",
        description=f"Designation: {created_contact.designation or 'N/A'}",
        user_id=current_user.id,
        related_company_id=id
    )

    return created_contact

