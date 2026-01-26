from datetime import datetime
from pydantic import BaseModel

class ChatThreadOut(BaseModel):
    id: int
    uuid: str | None
    title: str
    created_at: datetime
    updated_at: datetime

class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

class ChatThreadUpdate(BaseModel):
    title: str
