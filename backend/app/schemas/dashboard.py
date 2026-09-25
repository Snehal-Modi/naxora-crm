"""Dashboard metrics schemas."""

from typing import List, Optional
from pydantic import BaseModel
from app.schemas.activity import ActivityRead
from app.schemas.task import TaskRead


class AdminDashboardStats(BaseModel):
    total_candidates: int
    total_employers: int
    active_leads: int
    open_jobs: int
    pending_tasks: int
    upcoming_interviews: int
    active_courses: int = 0
    course_enquiries: int = 0
    active_enrollments: int = 0
    completed_enrollments: int = 0
    active_services: int = 0
    service_enquiries: int = 0
    total_placements: int = 0
    joined_placements: int = 0
    recent_activities: List[ActivityRead] = []
    urgent_tasks: List[TaskRead] = []


class StaffDashboardStats(BaseModel):
    my_leads: int
    my_candidates: int
    my_employers: int
    my_tasks: int
    overdue_tasks: int
    my_enrollments: int = 0
    my_placements: int = 0
    active_courses: int = 0
    course_enquiries: int = 0
    recent_activities: List[ActivityRead] = []
    today_tasks: List[TaskRead] = []
