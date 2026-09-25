"""Database models package."""

from app.models.base import Base, UUIDMixin, AuditMixin
from app.models.permission import Permission, role_permissions
from app.models.role import Role, user_roles
from app.models.user import User
from app.models.token import RefreshToken
from app.models.company import Company, Contact
from app.models.pipeline import Pipeline, PipelineStage
from app.models.candidate import Candidate
from app.models.lead import Lead, LeadAssignment
from app.models.job import JobRequirement, CandidateJobMatch
from app.models.task import Task
from app.models.activity import Activity
from app.models.note import Note
from app.models.course import CourseCategory, Course
from app.models.service import ServiceCategory, Service
from app.models.enrollment import Enrollment
from app.models.placement import Placement
from app.models.document import CandidateDocument

__all__ = [
    "Base",
    "UUIDMixin",
    "AuditMixin",
    "Permission",
    "role_permissions",
    "Role",
    "user_roles",
    "User",
    "RefreshToken",
    "Company",
    "Contact",
    "Pipeline",
    "PipelineStage",
    "Candidate",
    "Lead",
    "LeadAssignment",
    "JobRequirement",
    "CandidateJobMatch",
    "Task",
    "Activity",
    "Note",
    "CourseCategory",
    "Course",
    "ServiceCategory",
    "Service",
    "Enrollment",
    "Placement",
    "CandidateDocument",
]
