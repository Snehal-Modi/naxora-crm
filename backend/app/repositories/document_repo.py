"""Candidate document repository."""

from typing import List
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.document import CandidateDocument
from app.repositories.base import BaseRepository


class CandidateDocumentRepository(BaseRepository[CandidateDocument]):
    def __init__(self):
        super().__init__(CandidateDocument)

    def get_by_candidate(self, db: Session, candidate_id: uuid.UUID) -> List[CandidateDocument]:
        query = (
            select(CandidateDocument)
            .where(
                CandidateDocument.candidate_id == candidate_id,
                CandidateDocument.is_deleted == False
            )
            .order_by(CandidateDocument.created_at.desc())
        )
        return list(db.scalars(query).all())


document_repo = CandidateDocumentRepository()
