"""Service and Service Category management endpoints."""

from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundError, BadRequestError
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.models.service import Service, ServiceCategory
from app.repositories.service_repo import service_repo, service_category_repo
from app.schemas.service import (
    ServiceCategoryRead, ServiceCategoryCreate, ServiceCategoryUpdate,
    ServiceRead, ServiceCreate, ServiceUpdate
)
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


# =========================================================================
# Service Categories
# =========================================================================

@router.get("/categories", response_model=PaginatedResponse[ServiceCategoryRead], dependencies=[Depends(require_permission("services:view"))])
def list_service_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    """List service categories."""
    categories, total = service_category_repo.search_categories(
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


@router.post("/categories", response_model=ServiceCategoryRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("service_categories:create"))])
def create_service_category(
    payload: ServiceCategoryCreate,
    db: Session = Depends(get_db),
):
    """Create a new service category."""
    existing = service_category_repo.search_categories(db=db, search=payload.name)
    if any(c.name.lower() == payload.name.lower() for c in existing[0]):
        raise BadRequestError(f"Service category with name '{payload.name}' already exists.")

    category = ServiceCategory(**payload.model_dump())
    return service_category_repo.create(db=db, obj=category)


@router.put("/categories/{id}", response_model=ServiceCategoryRead, dependencies=[Depends(require_permission("service_categories:edit"))])
def update_service_category(
    id: uuid.UUID,
    payload: ServiceCategoryUpdate,
    db: Session = Depends(get_db),
):
    """Update a service category."""
    category = service_category_repo.get_by_id(db=db, id=id)
    if not category:
        raise NotFoundError("Service category not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(category, field, val)

    return service_category_repo.update(db=db, obj=category)


@router.delete("/categories/{id}", response_model=MessageResponse, dependencies=[Depends(require_permission("service_categories:archive"))])
def delete_service_category(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Archive / soft delete a service category."""
    category = service_category_repo.get_by_id(db=db, id=id)
    if not category:
        raise NotFoundError("Service category not found.")

    service_category_repo.soft_delete(db=db, obj=category)
    return MessageResponse(message="Service category archived successfully.")


# =========================================================================
# Services
# =========================================================================

@router.get("", response_model=PaginatedResponse[ServiceRead], dependencies=[Depends(require_permission("services:view"))])
def list_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    category_id: Optional[uuid.UUID] = Query(None),
    delivery_mode: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List services with filters."""
    services, total = service_repo.search_services(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        category_id=category_id,
        delivery_mode=delivery_mode,
        status=status,
    )
    total_pages = (total + limit - 1) // limit if total > 0 else 0
    page = (skip // limit) + 1

    return PaginatedResponse(
        items=services,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.post("", response_model=ServiceRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("services:create"))])
def create_service(
    payload: ServiceCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create a new service."""
    existing, _ = service_repo.search_services(db=db, search=payload.code)
    if any(s.code.lower() == payload.code.lower() for s in existing):
        raise BadRequestError(f"Service code '{payload.code}' is already registered.")

    service = Service(**payload.model_dump(), created_by_id=current_user.id)
    return service_repo.create(db=db, obj=service)


@router.get("/{id}", response_model=ServiceRead, dependencies=[Depends(require_permission("services:view"))])
def get_service(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Get single service by ID."""
    service = service_repo.get_by_id(db=db, id=id)
    if not service:
        raise NotFoundError("Service not found.")
    return service


@router.put("/{id}", response_model=ServiceRead, dependencies=[Depends(require_permission("services:edit"))])
def update_service(
    id: uuid.UUID,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
):
    """Update service details."""
    service = service_repo.get_by_id(db=db, id=id)
    if not service:
        raise NotFoundError("Service not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(service, field, val)

    return service_repo.update(db=db, obj=service)


@router.delete("/{id}", response_model=MessageResponse, dependencies=[Depends(require_permission("services:archive"))])
def delete_service(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Archive a service."""
    service = service_repo.get_by_id(db=db, id=id)
    if not service:
        raise NotFoundError("Service not found.")

    service_repo.soft_delete(db=db, obj=service)
    return MessageResponse(message="Service archived successfully.")
