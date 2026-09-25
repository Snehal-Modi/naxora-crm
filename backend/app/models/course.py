"""Course and CourseCategory models."""

from datetime import date
from decimal import Decimal
import uuid
from sqlalchemy import String, Numeric, Date, Integer, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin


class CourseCategory(Base, UUIDMixin, AuditMixin):
    __tablename__ = "course_categories"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    courses = relationship("Course", back_populates="category")

    def __repr__(self) -> str:
        return f"<CourseCategory(name='{self.name}', is_active={self.is_active})>"


class Course(Base, UUIDMixin, AuditMixin):
    __tablename__ = "courses"

    name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course_categories.id", ondelete="SET NULL"), index=True, nullable=True
    )
    duration: Mapped[str | None] = mapped_column(String(50), nullable=True)  # e.g. "3 Months", "40 Hours"
    mode: Mapped[str] = mapped_column(String(50), default="online", nullable=False)  # online, offline, hybrid
    fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", index=True, nullable=False)  # draft, active, inactive, completed, archived
    capacity: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )

    category = relationship("CourseCategory", back_populates="courses", lazy="selectin")
    created_by = relationship("User", foreign_keys=[created_by_id], lazy="selectin")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Course(name='{self.name}', code='{self.code}', status='{self.status}')>"
