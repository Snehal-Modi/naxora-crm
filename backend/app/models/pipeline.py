"""Pipeline and PipelineStage models for configurable CRM workflows."""

import uuid
from sqlalchemy import String, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin


class Pipeline(Base, UUIDMixin, AuditMixin):
    __tablename__ = "pipelines"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    lead_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # candidate, employer, course, service
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    stages = relationship("PipelineStage", back_populates="pipeline", cascade="all, delete-orphan", order_by="PipelineStage.stage_order", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Pipeline(name='{self.name}', lead_type='{self.lead_type}')>"


class PipelineStage(Base, UUIDMixin, AuditMixin):
    __tablename__ = "pipeline_stages"

    pipeline_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pipelines.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    stage_order: Mapped[int] = mapped_column(Integer, nullable=False)
    color: Mapped[str] = mapped_column(String(20), default="#3B82F6", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    pipeline = relationship("Pipeline", back_populates="stages")

    def __repr__(self) -> str:
        return f"<PipelineStage(name='{self.name}', order={self.stage_order})>"

