from ninja import Schema
from typing import Optional

class UserCreate(Schema):
    username: str
    password: str
    role: str # "admin" or "user"

class UserSchema(Schema):
    id: int
    username: str
    role: Optional[str] = None
    tenant: Optional[str] = None
