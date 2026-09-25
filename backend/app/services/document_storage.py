"""Candidate document storage and validation service."""

import os
from pathlib import Path
import re
import uuid
import shutil
from fastapi import HTTPException, UploadFile, status

# Storage path relative to backend root
STORAGE_DIR = Path(__file__).resolve().parent.parent.parent / "storage" / "documents"

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "text/plain",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def sanitize_filename(filename: str) -> str:
    """Sanitize user provided filename to remove unsafe characters."""
    filename = os.path.basename(filename)
    filename = re.sub(r"[^\w\.\-]", "_", filename)
    return filename[:200]


def ensure_storage_dir() -> Path:
    """Ensure document storage directory exists."""
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    return STORAGE_DIR


def save_document_file(file: UploadFile) -> tuple[str, str, int, str]:
    """Validate and save an uploaded candidate document.
    
    Returns:
        tuple of (stored_filename, original_filename, file_size, content_type)
    """
    original_filename = sanitize_filename(file.filename or "unnamed_document")
    content_type = file.content_type or "application/octet-stream"

    if content_type not in ALLOWED_MIME_TYPES:
        # Check by extension if content type was generic
        ext = Path(original_filename).suffix.lower()
        ext_to_mime = {
            ".pdf": "application/pdf",
            ".doc": "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".txt": "text/plain",
        }
        if ext in ext_to_mime:
            content_type = ext_to_mime[ext]
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{content_type}'. Allowed types: PDF, DOC, DOCX, PNG, JPG, TXT.",
            )

    ensure_storage_dir()
    unique_prefix = uuid.uuid4().hex
    stored_filename = f"{unique_prefix}_{original_filename}"
    dest_path = STORAGE_DIR / stored_filename

    total_size = 0
    chunk_size = 64 * 1024  # 64 KB

    try:
        with open(dest_path, "wb") as out_file:
            while chunk := file.file.read(chunk_size):
                total_size += len(chunk)
                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="File exceeds maximum allowed size of 10MB.",
                    )
                out_file.write(chunk)
    except Exception:
        if dest_path.exists():
            dest_path.unlink()
        raise

    return stored_filename, original_filename, total_size, content_type


def get_document_path(stored_filename: str) -> Path:
    """Get absolute file path ensuring no directory traversal."""
    sanitized = os.path.basename(stored_filename)
    file_path = (STORAGE_DIR / sanitized).resolve()
    if not str(file_path).startswith(str(STORAGE_DIR.resolve())):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to requested file.",
        )
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found on disk.",
        )
    return file_path


def delete_document_file(stored_filename: str) -> None:
    """Delete document from disk if it exists."""
    try:
        file_path = get_document_path(stored_filename)
        if file_path.exists():
            file_path.unlink()
    except Exception:
        pass
