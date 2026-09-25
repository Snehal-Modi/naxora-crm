"""Candidate model for job seeker management."""

from datetime import date
from decimal import Decimal
import uuid
from sqlalchemy import String, Numeric, Date, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin


class Candidate(Base, UUIDMixin, AuditMixin):
    __tablename__ = "candidates"

    first_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    alternate_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), index=True, nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="India", nullable=False)
    current_location: Mapped[str | None] = mapped_column(String(150), index=True, nullable=True)
    highest_education: Mapped[str | None] = mapped_column(String(100), nullable=True)
    experience_years: Mapped[Decimal] = mapped_column(Numeric(4, 1), default=0.0, nullable=False)
    current_job_title: Mapped[str | None] = mapped_column(String(150), index=True, nullable=True)
    current_company: Mapped[str | None] = mapped_column(String(150), nullable=True)
    expected_salary: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    notice_period: Mapped[str | None] = mapped_column(String(50), nullable=True)
    skills: Mapped[str | None] = mapped_column(Text, index=True, nullable=True)  # Comma-separated or tagged string
    preferred_job_title: Mapped[str | None] = mapped_column(String(150), nullable=True)
    preferred_location: Mapped[str | None] = mapped_column(String(150), nullable=True)
    employment_status: Mapped[str] = mapped_column(String(50), default="employed", nullable=False)
    availability_status: Mapped[str] = mapped_column(String(50), default="available", nullable=False)
    source: Mapped[str] = mapped_column(String(50), default="manual", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", index=True, nullable=False)
    assigned_staff_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    assigned_staff = relationship("User", foreign_keys=[assigned_staff_id], lazy="selectin")
    job_matches = relationship("CandidateJobMatch", back_populates="candidate", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="candidate", cascade="all, delete-orphan")
    placements = relationship("Placement", back_populates="candidate", cascade="all, delete-orphan")
    documents = relationship("CandidateDocument", back_populates="candidate", cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __repr__(self) -> str:
        return f"<Candidate(name='{self.full_name}', email='{self.email}')>"

