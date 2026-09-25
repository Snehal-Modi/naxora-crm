"""User model definition."""

from datetime import datetime
from typing import List, Set
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import UUIDMixin, AuditMixin
from app.models.role import user_roles


class User(Base, UUIDMixin, AuditMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    roles = relationship("Role", secondary=user_roles, back_populates="users", lazy="selectin")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def permission_codes(self) -> Set[str]:
        """Aggregate all permission codes from user's active roles."""
        if self.is_superuser:
            return {"*"}
        perms: Set[str] = set()
        for role in self.roles:
            for perm in role.permissions:
                perms.add(perm.code)
        return perms

    def has_permission(self, permission_code: str) -> bool:
        """Check if user has a specific permission code or is superuser."""
        if self.is_superuser:
            return True
        return permission_code in self.permission_codes

    def __repr__(self) -> str:
        return f"<User(email='{self.email}', full_name='{self.full_name}')>"

