"""Placement model for tracking candidate placement lifecycle."""

from datetime import date
from decimal import Decimal
import uuid
from sqlalchemy import String, Numeric, Date, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin


class Placement(Base, UUIDMixin, AuditMixin):
    __tablename__ = "placements"

    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), index=True, nullable=False
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    job_requirement_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_requirements.id", ondelete="SET NULL"), index=True, nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50), default="interview_scheduled", index=True, nullable=False
    )  # applied, screening, interview_scheduled, interview_completed, offered, joined, rejected, backed_out
    interview_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    offer_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    joining_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    salary_offered: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    placement_fee: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )

    candidate = relationship("Candidate", back_populates="placements", lazy="selectin")
    company = relationship("Company", back_populates="placements", lazy="selectin")
    job_requirement = relationship("JobRequirement", lazy="selectin")
    created_by = relationship("User", foreign_keys=[created_by_id], lazy="selectin")

    def __repr__(self) -> str:
        return f"<Placement(candidate_id='{self.candidate_id}', company_id='{self.company_id}', status='{self.status}')>"
