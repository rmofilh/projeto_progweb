from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Relationship

class UserPattern(SQLModel, table=True):
    __tablename__ = "user_patterns"
    user_id: UUID = Field(foreign_key="users.id", primary_key=True)
    pattern_id: UUID = Field(foreign_key="patterns.id", primary_key=True)
    favorited_at: datetime = Field(default_factory=datetime.utcnow)
    synced_offline: bool = Field(default=False)

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = None

    patterns: List["Pattern"] = Relationship(back_populates="favorited_by", link_model=UserPattern)

class Collection(SQLModel, table=True):
    __tablename__ = "collections"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    cover_image_path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    patterns: List["Pattern"] = Relationship(back_populates="collection")

class Pattern(SQLModel, table=True):
    __tablename__ = "patterns"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    collection_id: Optional[UUID] = Field(default=None, foreign_key="collections.id")
    title: str
    image_path: str
    thumbnail_path: str
    scale_cm_reference: float
    difficulty_level: int = Field(ge=1, le=5)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    collection: Optional[Collection] = Relationship(back_populates="patterns")
    favorited_by: List[User] = Relationship(back_populates="patterns", link_model=UserPattern)
