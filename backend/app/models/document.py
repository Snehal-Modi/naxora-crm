"""CandidateDocument model for candidate files and resumes."""

import uuid
from sqlalchemy import String, Integer, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin


class CandidateDocument(Base, UUIDMixin, AuditMixin):
    __tablename__ = "candidate_documents"

    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    document_type: Mapped[str] = mapped_column(String(50), index=True, default="resume", nullable=False)
    # resume, id_proof, educational, certificate, offer_letter, payslip, other
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # in bytes
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    uploaded_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    candidate = relationship("Candidate", back_populates="documents", lazy="selectin")
    uploaded_by = relationship("User", foreign_keys=[uploaded_by_id], lazy="selectin")

    def __repr__(self) -> str:
        return f"<CandidateDocument(candidate_id='{self.candidate_id}', title='{self.title}', type='{self.document_type}')>"
