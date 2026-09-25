"""Database seeder for permissions, initial roles, admin user, and pipelines."""

import logging
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User
from app.models.pipeline import Pipeline, PipelineStage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

INITIAL_PERMISSIONS = [
    # Users
    ("users:view", "users", "View system users and staff list"),
    ("users:create", "users", "Create new system user accounts"),
    ("users:edit", "users", "Modify existing user accounts"),
    ("users:delete", "users", "Deactivate or remove user accounts"),
    
    # Leads
    ("leads:view", "leads", "View CRM leads"),
    ("leads:create", "leads", "Create new leads"),
    ("leads:edit", "leads", "Update lead status and details"),
    ("leads:delete", "leads", "Delete leads"),
    ("leads:archive", "leads", "Archive leads"),
    ("leads:assign", "leads", "Assign or reassign leads to staff"),
    
    # Candidates
    ("candidates:view", "candidates", "View candidate profiles and resumes"),
    ("candidates:create", "candidates", "Create new candidate records"),
    ("candidates:edit", "candidates", "Edit candidate profiles"),
    ("candidates:delete", "candidates", "Archive candidate records"),
    ("candidates:archive", "candidates", "Archive or soft-delete candidates"),

    # Employers
    ("employers:view", "employers", "View employer company profiles"),
    ("employers:create", "employers", "Register new employer accounts"),
    ("employers:edit", "employers", "Edit employer details"),
    # Employers / Companies
    ("companies:view", "companies", "View employer company profiles"),
    ("companies:create", "companies", "Register new employer accounts"),
    ("companies:edit", "companies", "Edit employer details"),
    ("companies:archive", "companies", "Archive employer profiles"),

    # Contacts
    ("contacts:view", "contacts", "View company contact persons"),
    ("contacts:create", "contacts", "Add company contact persons"),
    ("contacts:edit", "contacts", "Edit company contact details"),
    ("contacts:archive", "contacts", "Archive company contacts"),

    # Jobs
    ("jobs:view", "jobs", "View job openings"),
    ("jobs:create", "jobs", "Post new job requirements"),
    ("jobs:edit", "jobs", "Modify job requirements"),
    ("jobs:archive", "jobs", "Archive job requirements"),

    # Pipelines
    ("pipelines:view", "pipelines", "View CRM pipelines and stages"),
    ("pipelines:manage", "pipelines", "Create and configure pipelines and stages"),

    # Tasks
    ("tasks:view", "tasks", "View assigned or team tasks"),
    ("tasks:create", "tasks", "Create new tasks and follow-ups"),
    ("tasks:edit", "tasks", "Edit task details"),
    ("tasks:complete", "tasks", "Mark tasks as completed"),

    # Activities
    ("activities:view", "activities", "View CRM chronological activity timeline"),
    ("activities:create", "activities", "Log calls, meetings, notes, and activities"),

    # Notes
    ("notes:view", "notes", "View CRM notes"),
    ("notes:create", "notes", "Add notes to candidates, leads, employers, or jobs"),
    ("notes:edit", "notes", "Edit existing notes"),

    # Courses
    ("courses:view", "courses", "View courses and catalogue"),
    ("courses:create", "courses", "Create and publish courses"),
    ("courses:edit", "courses", "Edit course information and schedule"),
    ("courses:archive", "courses", "Archive courses"),

    # Course Categories
    ("course_categories:view", "course_categories", "View course categories"),
    ("course_categories:create", "course_categories", "Create course categories"),
    ("course_categories:edit", "course_categories", "Edit course categories"),
    ("course_categories:archive", "course_categories", "Archive course categories"),

    # Enrollments
    ("enrollments:view", "enrollments", "View course enrollments and student progress"),
    ("enrollments:create", "enrollments", "Enroll candidates in courses"),
    ("enrollments:edit", "enrollments", "Update enrollment progress and completion"),
    ("enrollments:archive", "enrollments", "Cancel or archive enrollments"),

    # Services
    ("services:view", "services", "View service catalogue"),
    ("services:create", "services", "Create new service offerings"),
    ("services:edit", "services", "Edit service offerings"),
    ("services:archive", "services", "Archive service offerings"),

    # Service Categories
    ("service_categories:view", "service_categories", "View service categories"),
    ("service_categories:create", "service_categories", "Create service categories"),
    ("service_categories:edit", "service_categories", "Edit service categories"),
    ("service_categories:archive", "service_categories", "Archive service categories"),

    # Placements
    ("placements:view", "placements", "View candidate placements and outcomes"),
    ("placements:create", "placements", "Create candidate placement tracking records"),
    ("placements:edit", "placements", "Update placement status, offers, and join dates"),
    ("placements:archive", "placements", "Archive placement records"),

    # Documents
    ("documents:view", "documents", "View and download candidate resumes and documents"),
    ("documents:create", "documents", "Upload candidate resumes and documents"),
    ("documents:delete", "documents", "Delete or archive candidate documents"),

    # Reports
    ("reports:view", "reports", "Access CRM analytics and operational reports"),

    # Payroll
    ("payroll:view", "payroll", "View payroll and salary records"),
    ("payroll:manage", "payroll", "Generate and disburse payroll records"),

    # Settings
    ("settings:manage", "settings", "Manage system settings, roles, and pipelines"),
]

STAFF_PERMISSIONS = [
    "leads:view", "leads:create", "leads:edit", "leads:archive",
    "candidates:view", "candidates:create", "candidates:edit", "candidates:archive",
    "companies:view", "companies:create", "companies:edit", "companies:archive",
    "contacts:view", "contacts:create", "contacts:edit",
    "jobs:view", "jobs:create", "jobs:edit",
    "pipelines:view",
    "tasks:view", "tasks:create", "tasks:edit", "tasks:complete",
    "activities:view", "activities:create",
    "notes:view", "notes:create", "notes:edit",
    "courses:view", "courses:create", "courses:edit",
    "course_categories:view",
    "enrollments:view", "enrollments:create", "enrollments:edit",
    "services:view", "services:create", "services:edit",
    "service_categories:view",
    "placements:view", "placements:create", "placements:edit",
    "documents:view", "documents:create", "documents:delete",
    "reports:view"
]

CANDIDATE_PIPELINE_STAGES = [
    ("New", "#64748B"),
    ("Contacted", "#3B82F6"),
    ("Screening", "#8B5CF6"),
    ("Training", "#F59E0B"),
    ("Submitted", "#EC4899"),
    ("Interview", "#6366F1"),
    ("Placed", "#10B981"),
    ("Closed", "#94A3B8"),
]

EMPLOYER_PIPELINE_STAGES = [
    ("New", "#64748B"),
    ("Contacted", "#3B82F6"),
    ("Requirement Received", "#8B5CF6"),
    ("Candidates Submitted", "#EC4899"),
    ("Interview", "#6366F1"),
    ("Hired", "#10B981"),
    ("Closed", "#94A3B8"),
]


def seed_database(db: Session) -> None:
    logger.info("Seeding initial permissions...")
    permission_map = {}
    for code, module, desc in INITIAL_PERMISSIONS:
        perm = db.scalar(select(Permission).where(Permission.code == code))
        if not perm:
            perm = Permission(code=code, module=module, description=desc)
            db.add(perm)
            db.flush()
            logger.info(f"Created permission: {code}")
        permission_map[code] = perm

    logger.info("Seeding initial roles: super_admin and staff...")
    # Super Admin Role
    super_admin_role = db.scalar(select(Role).where(Role.name == "super_admin"))
    if not super_admin_role:
        super_admin_role = Role(
            name="super_admin",
            display_name="Super Administrator",
            description="Full system control and configuration privileges",
            is_system_role=True
        )
        super_admin_role.permissions = list(permission_map.values())
        db.add(super_admin_role)
        logger.info("Created super_admin role")
    else:
        super_admin_role.permissions = list(permission_map.values())

    # Staff Role
    staff_role = db.scalar(select(Role).where(Role.name == "staff"))
    if not staff_role:
        staff_role = Role(
            name="staff",
            display_name="Staff / Recruitment Consultant",
            description="Operational access to leads, candidates, employers, and jobs",
            is_system_role=True
        )
        staff_role.permissions = [permission_map[code] for code in STAFF_PERMISSIONS if code in permission_map]
        db.add(staff_role)
        logger.info("Created staff role")
    else:
        staff_role.permissions = [permission_map[code] for code in STAFF_PERMISSIONS if code in permission_map]

    db.commit()

    # Seed Default Pipelines
    logger.info("Seeding default CRM pipelines...")
    cand_pipeline = db.scalar(select(Pipeline).where(Pipeline.name == "Candidate Pipeline"))
    if not cand_pipeline:
        cand_pipeline = Pipeline(name="Candidate Pipeline", lead_type="candidate", is_default=True)
        db.add(cand_pipeline)
        db.flush()
        for idx, (stage_name, color) in enumerate(CANDIDATE_PIPELINE_STAGES):
            stage = PipelineStage(pipeline_id=cand_pipeline.id, name=stage_name, stage_order=idx + 1, color=color)
            db.add(stage)
        logger.info("Created Candidate Pipeline with stages")

    emp_pipeline = db.scalar(select(Pipeline).where(Pipeline.name == "Employer Pipeline"))
    if not emp_pipeline:
        emp_pipeline = Pipeline(name="Employer Pipeline", lead_type="employer", is_default=True)
        db.add(emp_pipeline)
        db.flush()
        for idx, (stage_name, color) in enumerate(EMPLOYER_PIPELINE_STAGES):
            stage = PipelineStage(pipeline_id=emp_pipeline.id, name=stage_name, stage_order=idx + 1, color=color)
            db.add(stage)
        logger.info("Created Employer Pipeline with stages")

    db.commit()

    # Seed First Super Admin User
    admin_email = settings.FIRST_SUPERUSER_EMAIL.lower()
    admin_user = db.scalar(select(User).where(User.email == admin_email))
    if not admin_user:
        admin_user = User(
            email=admin_email,
            hashed_password=hash_password(settings.FIRST_SUPERUSER_PASSWORD),
            first_name=settings.FIRST_SUPERUSER_FIRST_NAME,
            last_name=settings.FIRST_SUPERUSER_LAST_NAME,
            is_active=True,
            is_superuser=True,
            phone="+919876543210"
        )
        admin_user.roles.append(super_admin_role)
        db.add(admin_user)
        db.commit()
        logger.info(f"Created first super admin account: {admin_email}")
    else:
        logger.info(f"Super admin account already exists: {admin_email}")

    # Seed Demo Staff User for Dev Testing
    staff_email = "staff@nexorastaffing.com"
    staff_user = db.scalar(select(User).where(User.email == staff_email))
    if not staff_user:
        staff_user = User(
            email=staff_email,
            hashed_password=hash_password("NexoraStaff@2026!"),
            first_name="Anita",
            last_name="Sharma",
            is_active=True,
            is_superuser=False,
            phone="+919876543211"
        )
        staff_user.roles.append(staff_role)
        db.add(staff_user)
        db.commit()
        logger.info(f"Created demo staff account: {staff_email}")

    logger.info("Database seeding complete!")


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db_session:
        seed_database(db_session)

