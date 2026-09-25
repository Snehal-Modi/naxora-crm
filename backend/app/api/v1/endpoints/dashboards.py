"""CRM Dashboard statistics and metrics endpoints."""

from datetime import datetime, timezone
from typing import Union
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.models.candidate import Candidate
from app.models.company import Company
from app.models.lead import Lead
from app.models.job import JobRequirement
from app.models.task import Task
from app.models.course import Course
from app.models.service import Service
from app.models.enrollment import Enrollment
from app.models.placement import Placement
from app.repositories.activity_repo import activity_repo
from app.schemas.dashboard import AdminDashboardStats, StaffDashboardStats

router = APIRouter()


@router.get("/stats", response_model=Union[AdminDashboardStats, StaffDashboardStats])
def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Return role-aware real-time CRM statistics.
    Superusers and Admins receive enterprise-wide totals.
    Recruiters / Staff receive personal portfolio metrics.
    """
    now = datetime.now(timezone.utc)
    recent_activities = activity_repo.get_timeline(db=db, limit=10)

    # Enterprise-wide metrics for courses, services, and enquiries
    active_courses = db.scalar(
        select(func.count(Course.id)).where(Course.is_deleted == False, Course.status == "active")
    ) or 0

    course_enquiries = db.scalar(
        select(func.count(Lead.id)).where(Lead.is_deleted == False, Lead.lead_type == "course")
    ) or 0

    active_enrollments = db.scalar(
        select(func.count(Enrollment.id)).where(
            Enrollment.is_deleted == False, Enrollment.status.in_(["enrolled", "in_progress"])
        )
    ) or 0

    completed_enrollments = db.scalar(
        select(func.count(Enrollment.id)).where(
            Enrollment.is_deleted == False, Enrollment.status == "completed"
        )
    ) or 0

    active_services = db.scalar(
        select(func.count(Service.id)).where(Service.is_deleted == False, Service.status == "active")
    ) or 0

    service_enquiries = db.scalar(
        select(func.count(Lead.id)).where(Lead.is_deleted == False, Lead.lead_type == "service")
    ) or 0

    total_placements = db.scalar(
        select(func.count(Placement.id)).where(Placement.is_deleted == False)
    ) or 0

    joined_placements = db.scalar(
        select(func.count(Placement.id)).where(Placement.is_deleted == False, Placement.status == "joined")
    ) or 0

    if current_user.is_superuser:
        total_candidates = db.scalar(
            select(func.count(Candidate.id)).where(Candidate.is_deleted == False)
        ) or 0

        total_employers = db.scalar(
            select(func.count(Company.id)).where(Company.is_deleted == False)
        ) or 0

        active_leads = db.scalar(
            select(func.count(Lead.id)).where(Lead.is_deleted == False, Lead.status != "lost")
        ) or 0

        open_jobs = db.scalar(
            select(func.count(JobRequirement.id)).where(JobRequirement.is_deleted == False, JobRequirement.status == "open")
        ) or 0

        pending_tasks = db.scalar(
            select(func.count(Task.id)).where(Task.is_deleted == False, Task.status.notin_(["completed", "cancelled"]))
        ) or 0

        upcoming_interviews = db.scalar(
            select(func.count(Task.id)).where(
                Task.is_deleted == False,
                Task.title.ilike("%interview%"),
                Task.status.notin_(["completed", "cancelled"]),
                Task.due_date >= now
            )
        ) or 0

        urgent_tasks_query = select(Task).where(
            Task.is_deleted == False,
            Task.status.notin_(["completed", "cancelled"])
        ).order_by(Task.due_date.asc().nullslast()).limit(5)
        urgent_tasks = list(db.scalars(urgent_tasks_query).all())

        return AdminDashboardStats(
            total_candidates=total_candidates,
            total_employers=total_employers,
            active_leads=active_leads,
            open_jobs=open_jobs,
            pending_tasks=pending_tasks,
            upcoming_interviews=upcoming_interviews,
            active_courses=active_courses,
            course_enquiries=course_enquiries,
            active_enrollments=active_enrollments,
            completed_enrollments=completed_enrollments,
            active_services=active_services,
            service_enquiries=service_enquiries,
            total_placements=total_placements,
            joined_placements=joined_placements,
            recent_activities=recent_activities,
            urgent_tasks=urgent_tasks
        )

    else:
        my_leads = db.scalar(
            select(func.count(Lead.id)).where(Lead.is_deleted == False, Lead.assigned_staff_id == current_user.id)
        ) or 0

        my_candidates = db.scalar(
            select(func.count(Candidate.id)).where(Candidate.is_deleted == False, Candidate.assigned_staff_id == current_user.id)
        ) or 0

        my_employers = db.scalar(
            select(func.count(Company.id)).where(Company.is_deleted == False, Company.assigned_staff_id == current_user.id)
        ) or 0

        my_tasks = db.scalar(
            select(func.count(Task.id)).where(
                Task.is_deleted == False,
                Task.status.notin_(["completed", "cancelled"]),
                Task.assigned_user_id == current_user.id
            )
        ) or 0

        overdue_tasks = db.scalar(
            select(func.count(Task.id)).where(
                Task.is_deleted == False,
                Task.status.notin_(["completed", "cancelled"]),
                Task.assigned_user_id == current_user.id,
                Task.due_date < now
            )
        ) or 0

        my_enrollments = db.scalar(
            select(func.count(Enrollment.id)).where(
                Enrollment.is_deleted == False,
                Enrollment.created_by_id == current_user.id
            )
        ) or 0

        my_placements = db.scalar(
            select(func.count(Placement.id)).where(
                Placement.is_deleted == False,
                Placement.created_by_id == current_user.id
            )
        ) or 0

        today_tasks_query = select(Task).where(
            Task.is_deleted == False,
            Task.status.notin_(["completed", "cancelled"]),
            Task.assigned_user_id == current_user.id
        ).order_by(Task.due_date.asc().nullslast()).limit(5)
        today_tasks = list(db.scalars(today_tasks_query).all())

        return StaffDashboardStats(
            my_leads=my_leads,
            my_candidates=my_candidates,
            my_employers=my_employers,
            my_tasks=my_tasks,
            overdue_tasks=overdue_tasks,
            my_enrollments=my_enrollments,
            my_placements=my_placements,
            active_courses=active_courses,
            course_enquiries=course_enquiries,
            recent_activities=recent_activities,
            today_tasks=today_tasks
        )
