"""Lead repository."""

from datetime import datetime, timezone
from typing import Optional, List, Tuple
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from app.models.lead import Lead, LeadAssignment
from app.repositories.base import BaseRepository


class LeadRepository(BaseRepository[Lead]):
    def __init__(self):
        super().__init__(Lead)

    def search_leads(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        lead_type: Optional[str] = None,
        status: Optional[str] = None,
        stage_id: Optional[uuid.UUID] = None,
        priority: Optional[str] = None,
        assigned_staff_id: Optional[uuid.UUID] = None,
        scoped_user_id: Optional[uuid.UUID] = None,
    ) -> Tuple[List[Lead], int]:
        query = select(Lead).where(Lead.is_deleted == False)

        if scoped_user_id:
            query = query.where(
                or_(
                    Lead.assigned_staff_id == scoped_user_id,
                    Lead.assigned_staff_id.is_(None)
                )
            )
        elif assigned_staff_id:
            query = query.where(Lead.assigned_staff_id == assigned_staff_id)

        if lead_type:
            query = query.where(Lead.lead_type == lead_type)

        if status:
            query = query.where(Lead.status == status)

        if stage_id:
            query = query.where(Lead.stage_id == stage_id)

        if priority:
            query = query.where(Lead.priority == priority)

        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Lead.title.ilike(search_pattern),
                    Lead.first_name.ilike(search_pattern),
                    Lead.last_name.ilike(search_pattern),
                    Lead.company_name.ilike(search_pattern),
                    Lead.email.ilike(search_pattern),
                    Lead.phone.ilike(search_pattern)
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        results = db.scalars(query.order_by(Lead.updated_at.desc()).offset(skip).limit(limit)).all()
        return list(results), total

    def assign_lead(
        self,
        db: Session,
        lead: Lead,
        assigned_by_id: uuid.UUID,
        assigned_to_id: uuid.UUID,
        notes: Optional[str] = None
    ) -> Lead:
        lead.assigned_staff_id = assigned_to_id
        assignment = LeadAssignment(
            lead_id=lead.id,
            assigned_by_id=assigned_by_id,
            assigned_to_id=assigned_to_id,
            notes=notes,
            assigned_at=datetime.now(timezone.utc)
        )
        db.add(assignment)
        db.commit()
        db.refresh(lead)
        return lead


lead_repo = LeadRepository()
