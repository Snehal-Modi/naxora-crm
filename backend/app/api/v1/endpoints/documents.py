"""Candidate document management and secure file streaming endpoints."""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Form, File, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import NotFoundError, BadRequestError
from app.dependencies.auth import get_current_active_user
from app.dependencies.permissions import require_permission
from app.models.user import User
from app.models.document import CandidateDocument
from app.repositories.document_repo import document_repo
from app.repositories.candidate_repo import candidate_repo
from app.services.document_storage import (
    save_document_file,
    get_document_path,
    delete_document_file,
)
from app.schemas.document import DocumentRead
from app.schemas.common import MessageResponse

router = APIRouter()


@router.get("/candidates/{candidate_id}/documents", response_model=List[DocumentRead], dependencies=[Depends(require_permission("documents:view"))])
def list_candidate_documents(
    candidate_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """List all documents for a specific candidate."""
    candidate = candidate_repo.get_by_id(db=db, id=candidate_id)
    if not candidate:
        raise NotFoundError("Candidate not found.")

    return document_repo.get_by_candidate(db=db, candidate_id=candidate_id)


@router.post("/candidates/{candidate_id}/documents", response_model=DocumentRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("documents:create"))])
def upload_candidate_document(
    candidate_id: uuid.UUID,
    title: str = Form(...),
    document_type: str = Form("resume"),
    notes: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Upload and attach a document/resume to a candidate profile."""
    candidate = candidate_repo.get_by_id(db=db, id=candidate_id)
    if not candidate:
        raise NotFoundError("Candidate not found.")

    stored_filename, original_filename, file_size, content_type = save_document_file(file)

    doc = CandidateDocument(
        candidate_id=candidate_id,
        title=title,
        document_type=document_type,
        file_name=original_filename,
        file_path=stored_filename,
        file_size=file_size,
        mime_type=content_type,
        uploaded_by_id=current_user.id,
        notes=notes,
    )
    return document_repo.create(db=db, obj=doc)


@router.get("/documents/{id}/download", dependencies=[Depends(require_permission("documents:view"))])
def download_document(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Securely stream a candidate document. Requires authentication and documents:view permission."""
    doc = document_repo.get_by_id(db=db, id=id)
    if not doc:
        raise NotFoundError("Document not found.")

    file_path = get_document_path(doc.file_path)

    return FileResponse(
        path=str(file_path),
        filename=doc.file_name,
        media_type=doc.mime_type,
    )


@router.delete("/documents/{id}", response_model=MessageResponse, dependencies=[Depends(require_permission("documents:delete"))])
def delete_document(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Delete a candidate document."""
    doc = document_repo.get_by_id(db=db, id=id)
    if not doc:
        raise NotFoundError("Document not found.")

    delete_document_file(doc.file_path)
    document_repo.soft_delete(db=db, obj=doc)
    return MessageResponse(message="Document deleted successfully.")
