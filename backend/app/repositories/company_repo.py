"""Company and Contact repository."""

from typing import Optional, List, Tuple
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from app.models.company import Company, Contact
from app.repositories.base import BaseRepository


class CompanyRepository(BaseRepository[Company]):
    def __init__(self):
        super().__init__(Company)

    def search_companies(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        status: Optional[str] = None,
        industry: Optional[str] = None,
        assigned_staff_id: Optional[uuid.UUID] = None,
        scoped_user_id: Optional[uuid.UUID] = None,
    ) -> Tuple[List[Company], int]:
        query = select(Company).where(Company.is_deleted == False)

        if scoped_user_id:
            query = query.where(
                or_(
                    Company.assigned_staff_id == scoped_user_id,
                    Company.assigned_staff_id.is_(None)
                )
            )
        elif assigned_staff_id:
            query = query.where(Company.assigned_staff_id == assigned_staff_id)

        if status:
            query = query.where(Company.status == status)

        if industry:
            query = query.where(Company.industry.ilike(f"%{industry}%"))

        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Company.name.ilike(search_pattern),
                    Company.email.ilike(search_pattern),
                    Company.phone.ilike(search_pattern),
                    Company.city.ilike(search_pattern)
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        results = db.scalars(query.order_by(Company.updated_at.desc()).offset(skip).limit(limit)).all()
        return list(results), total

    def add_contact(self, db: Session, contact: Contact) -> Contact:
        db.add(contact)
        db.commit()
        db.refresh(contact)
        return contact

    def get_contact_by_id(self, db: Session, contact_id: uuid.UUID) -> Optional[Contact]:
        query = select(Contact).where(Contact.id == contact_id, Contact.is_deleted == False)
        return db.scalar(query)


company_repo = CompanyRepository()

