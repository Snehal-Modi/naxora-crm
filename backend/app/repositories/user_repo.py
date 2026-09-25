"""User repository for database operations on users and tokens."""

from datetime import datetime, timezone, timedelta
from typing import Optional, List
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.token import RefreshToken
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        query = select(User).where(User.email == email.lower(), User.is_deleted == False)
        return db.scalar(query)

    def create_refresh_token(
        self,
        db: Session,
        user_id: uuid.UUID,
        token_hash: str,
        expires_delta: timedelta,
        device_info: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> RefreshToken:
        now = datetime.now(timezone.utc)
        refresh_token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=now + expires_delta,
            device_info=device_info,
            ip_address=ip_address
        )
        db.add(refresh_token)
        db.commit()
        db.refresh(refresh_token)
        return refresh_token

    def get_active_refresh_token(self, db: Session, token_hash: str) -> Optional[RefreshToken]:
        now = datetime.now(timezone.utc)
        query = select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > now,
            RefreshToken.is_deleted == False
        )
        return db.scalar(query)

    def revoke_refresh_token(self, db: Session, token_hash: str) -> None:
        token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
        if token and not token.revoked_at:
            token.revoked_at = datetime.now(timezone.utc)
            db.commit()

    def revoke_all_user_tokens(self, db: Session, user_id: uuid.UUID) -> None:
        tokens = db.scalars(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None)
            )
        ).all()
        now = datetime.now(timezone.utc)
        for token in tokens:
            token.revoked_at = now
        db.commit()


user_repo = UserRepository()

