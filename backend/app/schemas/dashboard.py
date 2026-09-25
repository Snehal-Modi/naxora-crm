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
    recent_activities: List[ActivityRead] = []
    urgent_tasks: List[TaskRead] = []


class StaffDashboardStats(BaseModel):
    my_leads: int
    my_candidates: int
    my_employers: int
    my_tasks: int
    overdue_tasks: int
    recent_activities: List[ActivityRead] = []
    today_tasks: List[TaskRead] = []

