"""Master API v1 router definition."""

from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, users, roles
from app.api.v1.endpoints import (
    health,
    auth,
    users,
    roles,
    candidates,
    companies,
    pipelines,
    leads,
    jobs,
    tasks,
    activities,
    notes,
    dashboards,
)

api_router = APIRouter()

# System & Auth
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(roles.router, tags=["Roles & Permissions"])

# Core CRM Modules
api_router.include_router(candidates.router, prefix="/candidates", tags=["Candidates"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies & Employers"])
api_router.include_router(pipelines.router, prefix="/pipelines", tags=["Pipelines & Stages"])
api_router.include_router(leads.router, prefix="/leads", tags=["Leads"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Job Requirements"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks & Follow-ups"])
api_router.include_router(activities.router, prefix="/activities", tags=["Activities & Audit"])
api_router.include_router(notes.router, prefix="/notes", tags=["Notes"])
api_router.include_router(dashboards.router, prefix="/dashboards", tags=["Dashboard"])
