"""Service and ServiceCategory repositories."""

from typing import Optional, List, Tuple
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from app.models.service import Service, ServiceCategory
from app.repositories.base import BaseRepository


class ServiceCategoryRepository(BaseRepository[ServiceCategory]):
    def __init__(self):
        super().__init__(ServiceCategory)

    def search_categories(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Tuple[List[ServiceCategory], int]:
        query = select(ServiceCategory).where(ServiceCategory.is_deleted == False)

        if is_active is not None:
            query = query.where(ServiceCategory.is_active == is_active)

        if search:
            query = query.where(ServiceCategory.name.ilike(f"%{search}%"))

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        results = db.scalars(query.order_by(ServiceCategory.name.asc()).offset(skip).limit(limit)).all()
        return list(results), total


class ServiceRepository(BaseRepository[Service]):
    def __init__(self):
        super().__init__(Service)

    def search_services(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        delivery_mode: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Tuple[List[Service], int]:
        query = select(Service).where(Service.is_deleted == False)

        if category_id:
            query = query.where(Service.category_id == category_id)

        if delivery_mode:
            query = query.where(Service.delivery_mode == delivery_mode)

        if status:
            query = query.where(Service.status == status)

        if search:
            search_pat = f"%{search}%"
            query = query.where(
                or_(
                    Service.name.ilike(search_pat),
                    Service.code.ilike(search_pat),
                    Service.short_description.ilike(search_pat),
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        results = db.scalars(query.order_by(Service.created_at.desc()).offset(skip).limit(limit)).all()
        return list(results), total


service_category_repo = ServiceCategoryRepository()
service_repo = ServiceRepository()
