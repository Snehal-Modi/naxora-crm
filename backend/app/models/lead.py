"""Lead and LeadAssignment models."""

from datetime import datetime
import uuid
from sqlalchemy import String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin


class Lead(Base, UUIDMixin, AuditMixin):
    __tablename__ = "leads"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    lead_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # candidate, employer, course, service
    source: Mapped[str] = mapped_column(String(50), default="manual", nullable=False)  # manual, website, import, referral, other
    status: Mapped[str] = mapped_column(String(50), default="new", index=True, nullable=False)  # new, contacted, qualified, lost, converted
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)  # low, medium, high, urgent
    
    pipeline_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pipelines.id", ondelete="SET NULL"), index=True, nullable=True
    )
    stage_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pipeline_stages.id", ondelete="SET NULL"), index=True, nullable=True
    )
    candidate_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="SET NULL"), index=True, nullable=True
    )
    company_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="SET NULL"), index=True, nullable=True
    )
    assigned_staff_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )

    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    company_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), index=True, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_contacted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    next_follow_up_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True, nullable=True)

    pipeline = relationship("Pipeline", lazy="selectin")
    stage = relationship("PipelineStage", lazy="selectin")
    candidate = relationship("Candidate", lazy="selectin")
    company = relationship("Company", lazy="selectin")
    assigned_staff = relationship("User", foreign_keys=[assigned_staff_id], lazy="selectin")
    assignments = relationship("LeadAssignment", back_populates="lead", cascade="all, delete-orphan", order_by="desc(LeadAssignment.assigned_at)")

    def __repr__(self) -> str:
        return f"<Lead(title='{self.title}', type='{self.lead_type}', status='{self.status}')>"


class LeadAssignment(Base, UUIDMixin, AuditMixin):
    __tablename__ = "lead_assignments"

    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), index=True, nullable=False
    )
    assigned_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    assigned_to_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    lead = relationship("Lead", back_populates="assignments")
    assigned_by = relationship("User", foreign_keys=[assigned_by_id], lazy="selectin")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], lazy="selectin")

    def __repr__(self) -> str:
        return f"<LeadAssignment(lead_id='{self.lead_id}', assigned_to='{self.assigned_to_id}')>"

