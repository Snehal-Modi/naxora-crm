"""JobRequirement and CandidateJobMatch models."""

from datetime import date, datetime
from decimal import Decimal
import uuid
from sqlalchemy import String, Numeric, Date, DateTime, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin


class JobRequirement(Base, UUIDMixin, AuditMixin):
    __tablename__ = "job_requirements"

    job_title: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    contact_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    required_skills: Mapped[str | None] = mapped_column(Text, index=True, nullable=True)
    experience_min_years: Mapped[Decimal] = mapped_column(Numeric(4, 1), default=0.0, nullable=False)
    experience_max_years: Mapped[Decimal] = mapped_column(Numeric(4, 1), default=0.0, nullable=False)
    salary_min: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    salary_max: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    location: Mapped[str | None] = mapped_column(String(150), index=True, nullable=True)
    employment_type: Mapped[str] = mapped_column(String(50), default="full_time", nullable=False)
    vacancies: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="open", index=True, nullable=False)  # draft, open, on_hold, closed
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)  # low, medium, high, urgent
    assigned_staff_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )
    opened_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    closing_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    company = relationship("Company", back_populates="jobs", lazy="selectin")
    contact = relationship("Contact", lazy="selectin")
    assigned_staff = relationship("User", foreign_keys=[assigned_staff_id], lazy="selectin")
    candidate_matches = relationship("CandidateJobMatch", back_populates="job", cascade="all, delete-orphan", lazy="selectin")

    def __repr__(self) -> str:
        return f"<JobRequirement(title='{self.job_title}', company_id='{self.company_id}')>"


class CandidateJobMatch(Base, UUIDMixin, AuditMixin):
    __tablename__ = "candidate_job_matches"

    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), index=True, nullable=False
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_requirements.id", ondelete="CASCADE"), index=True, nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), default="submitted", index=True, nullable=False)
    # submitted, screening, interview_scheduled, offered, placed, rejected
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    interview_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    result: Mapped[str | None] = mapped_column(String(100), nullable=True)
    placement_status: Mapped[str | None] = mapped_column(String(50), nullable=True)  # pending, confirmed, joined, backed_out

    candidate = relationship("Candidate", back_populates="job_matches", lazy="selectin")
    job = relationship("JobRequirement", back_populates="candidate_matches", lazy="selectin")

    def __repr__(self) -> str:
        return f"<CandidateJobMatch(candidate_id='{self.candidate_id}', job_id='{self.job_id}', status='{self.status}')>"

