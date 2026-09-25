"""Schemas package."""

from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.permission import PermissionRead, PermissionCreate
from app.schemas.role import RoleRead, RoleCreate, RoleUpdate
from app.schemas.user import UserRead, UserCreate, UserUpdate, UserProfile
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest
from app.schemas.company import (
    ContactCreate, ContactUpdate, ContactRead,
    CompanyCreate, CompanyUpdate, CompanyRead, StaffSummary
)
from app.schemas.pipeline import (
    PipelineStageBase, PipelineStageCreate, PipelineStageRead,
    PipelineBase, PipelineCreate, PipelineRead
)
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateRead
from app.schemas.lead import (
    LeadAssignmentRead, LeadAssignRequest,
    LeadCreate, LeadUpdate, LeadRead
)
from app.schemas.job import (
    JobRequirementCreate, JobRequirementUpdate, JobRequirementRead,
    CandidateJobMatchCreate, CandidateJobMatchUpdate, CandidateJobMatchRead
)
from app.schemas.task import TaskCreate, TaskUpdate, TaskRead
from app.schemas.activity import ActivityCreate, ActivityRead
from app.schemas.note import NoteCreate, NoteUpdate, NoteRead
from app.schemas.dashboard import AdminDashboardStats, StaffDashboardStats

__all__ = [
    "MessageResponse",
    "PaginatedResponse",
    "PermissionRead",
    "PermissionCreate",
    "RoleRead",
    "RoleCreate",
    "RoleUpdate",
    "UserRead",
    "UserCreate",
    "UserUpdate",
    "UserProfile",
    "LoginRequest",
    "TokenResponse",
    "RefreshRequest",
    "ContactCreate",
    "ContactUpdate",
    "ContactRead",
    "CompanyCreate",
    "CompanyUpdate",
    "CompanyRead",
    "StaffSummary",
    "PipelineStageBase",
    "PipelineStageCreate",
    "PipelineStageRead",
    "PipelineBase",
    "PipelineCreate",
    "PipelineRead",
    "CandidateCreate",
    "CandidateUpdate",
    "CandidateRead",
    "LeadAssignmentRead",
    "LeadAssignRequest",
    "LeadCreate",
    "LeadUpdate",
    "LeadRead",
    "JobRequirementCreate",
    "JobRequirementUpdate",
    "JobRequirementRead",
    "CandidateJobMatchCreate",
    "CandidateJobMatchUpdate",
    "CandidateJobMatchRead",
    "TaskCreate",
    "TaskUpdate",
    "TaskRead",
    "ActivityCreate",
    "ActivityRead",
    "NoteCreate",
    "NoteUpdate",
    "NoteRead",
    "AdminDashboardStats",
    "StaffDashboardStats",
]

