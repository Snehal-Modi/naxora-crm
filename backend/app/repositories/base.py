"""Base repository with generic CRUD utilities."""

from typing import TypeVar, Generic, Type, Optional, List, Any
import uuid
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get_by_id(self, db: Session, id: uuid.UUID) -> Optional[ModelType]:
        query = select(self.model).where(self.model.id == id)
        if hasattr(self.model, "is_deleted"):
            query = query.where(self.model.is_deleted == False)  # noqa: E712
        return db.scalar(query)

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        query = select(self.model)
        if hasattr(self.model, "is_deleted"):
            query = query.where(self.model.is_deleted == False)  # noqa: E712
        return list(db.scalars(query.offset(skip).limit(limit)).all())

    def create(self, db: Session, obj: ModelType) -> ModelType:
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def update(self, db: Session, obj: ModelType) -> ModelType:
        db.commit()
        db.refresh(obj)
        return obj

    def soft_delete(self, db: Session, obj: ModelType) -> None:
        if hasattr(obj, "is_deleted"):
            obj.is_deleted = True
            db.commit()
        else:
            db.delete(obj)
            db.commit()

