"""Task and follow-up repository."""

from datetime import datetime, timezone
from typing import Optional, List, Tuple
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from app.models.task import Task
from app.repositories.base import BaseRepository


class TaskRepository(BaseRepository[Task]):
    def __init__(self):
        super().__init__(Task)

    def search_tasks(
        self,
        db: Session,
        filter_type: str = "my_tasks",  # my_tasks, team_tasks, overdue, today, upcoming
        user_id: Optional[uuid.UUID] = None,
        is_admin: bool = False,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Task], int]:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

        query = select(Task).where(Task.is_deleted == False)

        # Scoping
        if filter_type == "team_tasks" and is_admin:
            pass  # Admin can see all team tasks
        elif filter_type == "overdue":
            query = query.where(Task.due_date < now, Task.status.notin_(["completed", "cancelled"]))
            if not is_admin and user_id:
                query = query.where(Task.assigned_user_id == user_id)
        elif filter_type == "today":
            query = query.where(Task.due_date >= today_start, Task.due_date <= today_end)
            if not is_admin and user_id:
                query = query.where(Task.assigned_user_id == user_id)
        elif filter_type == "upcoming":
            query = query.where(Task.due_date > today_end)
            if not is_admin and user_id:
                query = query.where(Task.assigned_user_id == user_id)
        else:  # my_tasks default
            if user_id:
                query = query.where(Task.assigned_user_id == user_id)

        if status:
            query = query.where(Task.status == status)

        if priority:
            query = query.where(Task.priority == priority)

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        results = db.scalars(query.order_by(Task.due_date.asc().nulls_last(), Task.updated_at.desc()).offset(skip).limit(limit)).all()
        return list(results), total

    def complete_task(self, db: Session, task: Task) -> Task:
        task.status = "completed"
        task.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(task)
        return task


task_repo = TaskRepository()

