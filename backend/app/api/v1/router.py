"""Master API v1 router definition."""

from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, users, roles

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(roles.router, tags=["Roles & Permissions"])

