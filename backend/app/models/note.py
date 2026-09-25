"""Note model for CRM records."""

import uuid
from sqlalchemy import Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin


class Note(Base, UUIDMixin, AuditMixin):
    __tablename__ = "notes"

    content: Mapped[str] = mapped_column(Text, nullable=False)
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    
    related_lead_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), index=True, nullable=True
    )
    related_candidate_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), index=True, nullable=True
    )
    related_company_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), index=True, nullable=True
    )
    related_job_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_requirements.id", ondelete="CASCADE"), index=True, nullable=True
    )

    author = relationship("User", foreign_keys=[author_id], lazy="selectin")

    def __repr__(self) -> str:
        return f"<Note(id='{self.id}', author_id='{self.author_id}')>"

