"""Service and ServiceCategory models."""

from decimal import Decimal
import uuid
from sqlalchemy import String, Numeric, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin


class ServiceCategory(Base, UUIDMixin, AuditMixin):
    __tablename__ = "service_categories"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    services = relationship("Service", back_populates="category")

    def __repr__(self) -> str:
        return f"<ServiceCategory(name='{self.name}', is_active={self.is_active})>"


class Service(Base, UUIDMixin, AuditMixin):
    __tablename__ = "services"

    name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("service_categories.id", ondelete="SET NULL"), index=True, nullable=True
    )
    delivery_mode: Mapped[str] = mapped_column(String(50), default="online", nullable=False)  # online, offline, hybrid
    fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", index=True, nullable=False)  # draft, active, inactive, archived
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )

    category = relationship("ServiceCategory", back_populates="services", lazy="selectin")
    created_by = relationship("User", foreign_keys=[created_by_id], lazy="selectin")

    def __repr__(self) -> str:
        return f"<Service(name='{self.name}', code='{self.code}', status='{self.status}')>"
