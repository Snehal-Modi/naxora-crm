"""Company and Contact models for employer management."""

import uuid
from sqlalchemy import String, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin


class Company(Base, UUIDMixin, AuditMixin):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    industry: Mapped[str | None] = mapped_column(String(100), index=True, nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), index=True, nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="India", nullable=False)
    company_size: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="prospect", index=True, nullable=False)
    source: Mapped[str] = mapped_column(String(50), default="manual", nullable=False)
    assigned_staff_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    assigned_staff = relationship("User", foreign_keys=[assigned_staff_id], lazy="selectin")
    contacts = relationship("Contact", back_populates="company", cascade="all, delete-orphan", lazy="selectin")
    jobs = relationship("JobRequirement", back_populates="company")
    placements = relationship("Placement", back_populates="company", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Company(name='{self.name}', status='{self.status}')>"


class Contact(Base, UUIDMixin, AuditMixin):
    __tablename__ = "contacts"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    designation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    whatsapp_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    company = relationship("Company", back_populates="contacts")

    @property
    def full_name(self) -> str:
        if self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name

    def __repr__(self) -> str:
        return f"<Contact(name='{self.full_name}', company_id='{self.company_id}')>"

