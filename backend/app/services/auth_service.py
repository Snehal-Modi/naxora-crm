"""Authentication service business logic."""

from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import (
    verify_password,
    create_access_token,
    generate_refresh_token,
    hash_refresh_token
)
from app.core.exceptions import AuthenticationError
from app.models.user import User
from app.repositories.user_repo import user_repo
from app.schemas.auth import TokenResponse
from app.schemas.user import UserProfile


class AuthService:
    def authenticate_user(self, db: Session, email: str, password: str) -> User:
        user = user_repo.get_by_email(db, email=email)
        if not user or not user.is_active:
            raise AuthenticationError("Invalid email or password")
        
        if not verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")
        
        # Update last login timestamp
        user.last_login_at = datetime.now(timezone.utc)
        db.commit()
        return user

    def create_user_tokens(
        self,
        db: Session,
        user: User,
        device_info: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> TokenResponse:
        # Access token with user permissions and roles
        role_names = [role.name for role in user.roles]
        permission_codes = list(user.permission_codes)
        
        access_token_claims = {
            "email": user.email,
            "is_superuser": user.is_superuser,
            "roles": role_names,
        }
        access_token = create_access_token(
            subject=str(user.id),
            extra_claims=access_token_claims
        )

        # Refresh token
        raw_refresh_token = generate_refresh_token()
        token_hash = hash_refresh_token(raw_refresh_token)
        refresh_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        user_repo.create_refresh_token(
            db=db,
            user_id=user.id,
            token_hash=token_hash,
            expires_delta=refresh_delta,
            device_info=device_info,
            ip_address=ip_address
        )

        profile = UserProfile(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            is_superuser=user.is_superuser,
            is_active=user.is_active,
            roles=role_names,
            permissions=permission_codes,
            last_login_at=user.last_login_at
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            refresh_token=raw_refresh_token,
            user=profile
        )

    def refresh_session(self, db: Session, raw_refresh_token: str) -> TokenResponse:
        token_hash = hash_refresh_token(raw_refresh_token)
        db_token = user_repo.get_active_refresh_token(db, token_hash=token_hash)
        
        if not db_token:
            raise AuthenticationError("Invalid or expired refresh token")

        # Rotate refresh token: revoke current token
        db_token.revoke()
        db.commit()

        user = user_repo.get_by_id(db, id=db_token.user_id)
        if not user or not user.is_active:
            raise AuthenticationError("User is no longer active")

        # Issue new token pair
        return self.create_user_tokens(
            db=db,
            user=user,
            device_info=db_token.device_info,
            ip_address=db_token.ip_address
        )

    def logout(self, db: Session, raw_refresh_token: Optional[str] = None, user_id: Optional[uuid.UUID] = None) -> None:
        if raw_refresh_token:
            token_hash = hash_refresh_token(raw_refresh_token)
            user_repo.revoke_refresh_token(db, token_hash=token_hash)
        elif user_id:
            user_repo.revoke_all_user_tokens(db, user_id=user_id)


auth_service = AuthService()

