from ninja import Router
from ninja.errors import HttpError
from domain.users.schemas import UserCreate, UserSchema
from services.users_service import create_user, get_all_users_with_roles
from django.http import HttpRequest
from typing import List

router = Router(tags=["Users"])

@router.get("/", response=List[UserSchema])
def list_users_endpoint(request: HttpRequest):
    """
    Lists all users. Only accessible by admins.
    """
    if request.headers.get("x-user-role") != "admin":
        raise HttpError(403, "You do not have permission to view users.")
    
    return get_all_users_with_roles()

@router.post("/", response={201: None})
def create_user_endpoint(request: HttpRequest, data: UserCreate):
    """
    Creates a new user. Only accessible by admins.
    """
    # In a real application, this should be a proper permission check
    # based on an authenticated user. For now, we trust the header.
    if request.headers.get("x-user-role") != "admin":
        raise HttpError(403, "You do not have permission to create users.")

    create_user(data)
    return 201, None
