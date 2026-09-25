"""Task and follow-up management endpoints."""

from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.models.task import Task
from app.repositories.task_repo import task_repo
from app.repositories.activity_repo import activity_repo
from app.schemas.task import TaskRead, TaskCreate, TaskUpdate
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[TaskRead], dependencies=[Depends(require_permission("tasks:view"))])
def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    filter_type: str = Query("my_tasks"),  # my_tasks, team_tasks, overdue, today, upcoming
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List tasks with status/due-date grouping and staff scoping."""
    is_admin = current_user.is_superuser or current_user.has_permission("tasks:view_all")

    tasks, total = task_repo.search_tasks(
        db=db,
        filter_type=filter_type,
        user_id=current_user.id,
        is_admin=is_admin,
        status=status,
        priority=priority,
        skip=skip,
        limit=limit
    )

    total_pages = (total + limit - 1) // limit if total > 0 else 0
    page = (skip // limit) + 1

    return PaginatedResponse(
        items=tasks,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("tasks:create"))])
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new task or follow-up."""
    data = payload.model_dump()
    if not data.get("assigned_user_id"):
        data["assigned_user_id"] = current_user.id

    task = Task(**data)
    created = task_repo.create(db, task)

    activity_repo.log_activity(
        db=db,
        activity_type="task",
        title=f"Task Created: {created.title}",
        description=created.description,
        user_id=current_user.id,
        related_candidate_id=created.related_candidate_id,
        related_company_id=created.related_company_id,
        related_lead_id=created.related_lead_id,
        related_job_id=created.related_job_id
    )

    return created


@router.get("/{id}", response_model=TaskRead, dependencies=[Depends(require_permission("tasks:view"))])
def get_task(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieve single task details."""
    task = task_repo.get_by_id(db, id=id)
    if not task:
        raise NotFoundError("Task not found")

    if not current_user.is_superuser and not current_user.has_permission("tasks:view_all"):
        if task.assigned_user_id != current_user.id:
            raise PermissionDeniedError("Access restricted to assigned user")

    return task


@router.patch("/{id}", response_model=TaskRead, dependencies=[Depends(require_permission("tasks:edit"))])
def update_task(
    id: uuid.UUID,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update task details or status."""
    task = task_repo.get_by_id(db, id=id)
    if not task:
        raise NotFoundError("Task not found")

    if not current_user.is_superuser and not current_user.has_permission("tasks:edit_all"):
        if task.assigned_user_id != current_user.id:
            raise PermissionDeniedError("Access restricted to assigned user")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    return task_repo.update(db, task)


@router.post("/{id}/complete", response_model=TaskRead, dependencies=[Depends(require_permission("tasks:complete"))])
def mark_task_complete(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a task as completed."""
    task = task_repo.get_by_id(db, id=id)
    if not task:
        raise NotFoundError("Task not found")

    if not current_user.is_superuser and not current_user.has_permission("tasks:edit_all"):
        if task.assigned_user_id != current_user.id:
            raise PermissionDeniedError("Access restricted to assigned user")

    completed_task = task_repo.complete_task(db, task)

    activity_repo.log_activity(
        db=db,
        activity_type="task",
        title=f"Task Completed: {completed_task.title}",
        user_id=current_user.id,
        related_candidate_id=completed_task.related_candidate_id,
        related_company_id=completed_task.related_company_id,
        related_lead_id=completed_task.related_lead_id,
        related_job_id=completed_task.related_job_id
    )

    return completed_task

