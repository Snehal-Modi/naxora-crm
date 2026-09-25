"""Note repository."""

from typing import Optional, List
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.note import Note
from app.repositories.base import BaseRepository


class NoteRepository(BaseRepository[Note]):
    def __init__(self):
        super().__init__(Note)

    def get_notes(
        self,
        db: Session,
        related_candidate_id: Optional[uuid.UUID] = None,
        related_company_id: Optional[uuid.UUID] = None,
        related_lead_id: Optional[uuid.UUID] = None,
        related_job_id: Optional[uuid.UUID] = None,
    ) -> List[Note]:
        query = select(Note).where(Note.is_deleted == False)

        if related_candidate_id:
            query = query.where(Note.related_candidate_id == related_candidate_id)
        if related_company_id:
            query = query.where(Note.related_company_id == related_company_id)
        if related_lead_id:
            query = query.where(Note.related_lead_id == related_lead_id)
        if related_job_id:
            query = query.where(Note.related_job_id == related_job_id)

        query = query.order_by(Note.created_at.desc())
        return list(db.scalars(query).all())


note_repo = NoteRepository()

