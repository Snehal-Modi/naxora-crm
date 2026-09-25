"""Task and Follow-up model."""

from datetime import datetime
import uuid
from sqlalchemy import String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin


class Task(Base, UUIDMixin, AuditMixin):
    __tablename__ = "tasks"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)  # low, medium, high, urgent
    status: Mapped[str] = mapped_column(String(50), default="pending", index=True, nullable=False)  # pending, in_progress, completed, cancelled
    
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
    
    reminder_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    assigned_user = relationship("User", foreign_keys=[assigned_user_id], lazy="selectin")
    related_lead = relationship("Lead", lazy="selectin")
    related_candidate = relationship("Candidate", lazy="selectin")
    related_company = relationship("Company", lazy="selectin")
    related_job = relationship("JobRequirement", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Task(title='{self.title}', status='{self.status}', priority='{self.priority}')>"

