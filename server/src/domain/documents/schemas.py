from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, Field

class DocumentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    content: str | None = None

class DocumentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    content: str | None = None

class DocumentOut(BaseModel):
    id: int
    title: str
    content: str | None
    owner_username: str
    status: str
    delete_requested: bool = False
    created_at: datetime
    updated_at: datetime
