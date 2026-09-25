"""Note management endpoints."""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.models.note import Note
from app.repositories.note_repo import note_repo
from app.repositories.activity_repo import activity_repo
from app.schemas.note import NoteRead, NoteCreate, NoteUpdate

router = APIRouter()


@router.get("", response_model=List[NoteRead], dependencies=[Depends(require_permission("notes:view"))])
def list_notes(
    related_candidate_id: Optional[uuid.UUID] = Query(None),
    related_company_id: Optional[uuid.UUID] = Query(None),
    related_lead_id: Optional[uuid.UUID] = Query(None),
    related_job_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db)
):
    """List notes filtered by related CRM record."""
    return note_repo.get_notes(
        db=db,
        related_candidate_id=related_candidate_id,
        related_company_id=related_company_id,
        related_lead_id=related_lead_id,
        related_job_id=related_job_id
    )


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("notes:create"))])
def create_note(
    payload: NoteCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add a new note to any CRM entity."""
    note = Note(
        content=payload.content,
        author_id=current_user.id,
        related_lead_id=payload.related_lead_id,
        related_candidate_id=payload.related_candidate_id,
        related_company_id=payload.related_company_id,
        related_job_id=payload.related_job_id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    # Automatically log note activity
    snippet = payload.content[:60] + "..." if len(payload.content) > 60 else payload.content
    activity_repo.log_activity(
        db=db,
        activity_type="note",
        title=f"Note added by {current_user.full_name}",
        description=snippet,
        user_id=current_user.id,
        related_lead_id=payload.related_lead_id,
        related_candidate_id=payload.related_candidate_id,
        related_company_id=payload.related_company_id,
        related_job_id=payload.related_job_id
    )

    return note


@router.patch("/{note_id}", response_model=NoteRead, dependencies=[Depends(require_permission("notes:edit"))])
def update_note(
    note_id: uuid.UUID,
    payload: NoteUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update note content."""
    note = note_repo.get(db, note_id)
    if not note or note.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    # Only author or superuser can edit note
    if note.author_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit someone else's note")

    note.content = payload.content
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_permission("notes:delete"))])
def delete_note(
    note_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Soft delete note."""
    note = note_repo.get(db, note_id)
    if not note or note.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    if note.author_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete someone else's note")

    note.is_deleted = True
    db.commit()

