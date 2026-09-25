"""Database seeder for permissions, initial roles, and admin user."""

import logging
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User

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
    
    # Candidates
    ("candidates:view", "candidates", "View candidate profiles and resumes"),
    ("candidates:create", "candidates", "Create new candidate records"),
    ("candidates:edit", "candidates", "Edit candidate profiles"),
    ("candidates:delete", "candidates", "Archive candidate records"),

    # Employers
    ("employers:view", "employers", "View employer company profiles"),
    ("employers:create", "employers", "Register new employer accounts"),
    ("employers:edit", "employers", "Edit employer details"),

    # Jobs
    ("jobs:view", "jobs", "View job openings"),
    ("jobs:create", "jobs", "Post new job requirements"),
    ("jobs:edit", "jobs", "Modify job requirements"),

    # Reports
    ("reports:view", "reports", "Access CRM analytics and operational reports"),

    # Payroll
    ("payroll:view", "payroll", "View payroll and salary records"),
    ("payroll:manage", "payroll", "Generate and disburse payroll records"),

    # Settings
    ("settings:manage", "settings", "Manage system settings, roles, and pipelines"),
]

STAFF_PERMISSIONS = [
    "leads:view", "leads:create", "leads:edit",
    "candidates:view", "candidates:create", "candidates:edit",
    "employers:view", "employers:create", "employers:edit",
    "jobs:view", "jobs:create", "jobs:edit",
    "reports:view"
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

