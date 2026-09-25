"""Enrollment model connecting candidates and courses."""

from datetime import date
from decimal import Decimal
import uuid
from sqlalchemy import String, Numeric, Date, Integer, Boolean, Text, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin


class Enrollment(Base, UUIDMixin, AuditMixin):
    __tablename__ = "enrollments"
    __table_args__ = (
        CheckConstraint("progress_percentage >= 0 AND progress_percentage <= 100", name="check_enrollment_progress_percentage"),
    )

    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), index=True, nullable=False
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    enrollment_date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="enrolled", index=True, nullable=False)  # enrolled, in_progress, completed, dropped, cancelled
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    fee_paid: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    payment_status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)  # pending, partial, paid, refunded
    completion_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    certificate_issued: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )

    candidate = relationship("Candidate", back_populates="enrollments", lazy="selectin")
    course = relationship("Course", back_populates="enrollments", lazy="selectin")
    created_by = relationship("User", foreign_keys=[created_by_id], lazy="selectin")

    def __repr__(self) -> str:
        return f"<Enrollment(candidate_id='{self.candidate_id}', course_id='{self.course_id}', status='{self.status}')>"
