from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

class PatternBase(BaseModel):
    title: str
    scale_cm_reference: float
    difficulty_level: int = Field(ge=1, le=5)

class PatternCreate(PatternBase):
    image_path: str
    thumbnail_path: str
    collection_id: Optional[UUID] = None

class PatternResponse(PatternBase):
    id: UUID
    image_path: str
    thumbnail_path: str
    collection_id: Optional[UUID] = None

    class Config:
        from_attributes = True
