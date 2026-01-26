from ninja import Router
from ninja.errors import HttpError
from domain.users.schemas import UserCreate, UserSchema, UserRoleUpdate, UserPasswordReset
from services.users_service import create_user, get_all_users_with_roles, delete_user, update_user_role, reset_password
from django.http import HttpRequest
from typing import List

router = Router(tags=["Users"])

@router.get("/", response=List[UserSchema])
def list_users_endpoint(request: HttpRequest):
    """
    Lists all users.
    """
    return get_all_users_with_roles()

@router.post("/", response={201: UserSchema})
def create_user_endpoint(request: HttpRequest, data: UserCreate):
    """
    Creates a new user.
    """
    user = create_user(data)
    
    return 201, {
        "id": user.id,
        "username": user.username,
        "tenant": "default",
        "role": data.role
    }

@router.delete("/{user_id}", response={204: None})
def delete_user_endpoint(request: HttpRequest, user_id: int):
    """
    Deletes a user.
    """
    delete_user(user_id)
    return 204, None

@router.put("/{user_id}/role", response={200: None})
def update_user_role_endpoint(request: HttpRequest, user_id: int, data: UserRoleUpdate):
    """
    Updates a user's role.
    """
    update_user_role(user_id, data.role)
    return 200, None

@router.post("/{user_id}/reset-password", response={200: None})
def reset_password_endpoint(request: HttpRequest, user_id: int, data: UserPasswordReset):
    """
    Resets a user's password.
    """
    reset_password(user_id, data.password)
    return 200, None