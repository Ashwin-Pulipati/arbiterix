from django.contrib.auth.models import User
from asgiref.sync import async_to_sync
from integrations.authorizer import Authorizer
from domain.users.schemas import UserCreate, UserSchema
from integrations.permit_client import permit_client, permit_config

def create_user(data: UserCreate):
    """
    Creates a new user in Django, syncs them to Permit.io, and assigns a role.
    """
    # Create the user in Django
    user = User.objects.create_user(
        username=data.username,
        password=data.password,
    )

    if data.role == "admin":
        user.is_staff = True
        user.is_superuser = True
        user.save()

    # Sync the user to Permit.io and assign the role
    authorizer = Authorizer()
    authorizer.sync_user(user_key=str(user.id), email=f"{data.username}@example.com", first_name=data.username)

    if data.role == "admin":
        authorizer.assign_admin(user_key=str(user.id))
    else:
        authorizer.assign_user(user_key=str(user.id))
    
    return user

def delete_user(user_id: int):
    """
    Deletes a user from Django and Permit.io.
    """
    try:
        user = User.objects.get(id=user_id)
        
        # Delete from Permit.io
        async def _delete_permit_user():
            await permit_client.api.users.delete(str(user.id))
            
        try:
            async_to_sync(_delete_permit_user)()
        except Exception:
            # If deleting from Permit fails, we continue to delete from Django
            pass
            
        user.delete()
    except User.DoesNotExist:
        pass

def update_user_role(user_id: int, role: str):
    """
    Updates a user's role in Permit.io and local Django flags.
    """
    user = User.objects.get(id=user_id)
    authorizer = Authorizer()

    if role == "admin":
        user.is_staff = True
        user.is_superuser = True
        authorizer.assign_admin(user_key=str(user.id))
    else:
        user.is_staff = False
        user.is_superuser = False
        authorizer.assign_user(user_key=str(user.id))
    
    user.save()

def reset_password(user_id: int, new_password: str):
    """
    Resets a user's password.
    """
    user = User.objects.get(id=user_id)
    user.set_password(new_password)
    user.save()

def get_all_users_with_roles() -> list[UserSchema]:
    """
    Retrieves all users from Django and their roles from Permit.io.
    """
    users = User.objects.all()
    users_with_roles = []

    for user in users:
        user_schema = UserSchema(id=user.id, username=user.username, tenant=permit_config.tenant_key)
        
        async def _get_roles():
            return await permit_client.api.users.get_assigned_roles(user_key=str(user.id))

        try:
            assigned_roles = async_to_sync(_get_roles)()
            if assigned_roles:
                user_schema.role = assigned_roles[0].role
            else:
                # Fallback to local DB flags if Permit returns nothing
                if user.is_superuser or user.is_staff:
                    user_schema.role = "admin"
                else:
                    user_schema.role = "user"
        except Exception:
            # Handle cases where the user might not be in Permit.io yet, fallback to local DB flags
            if user.is_superuser or user.is_staff:
                user_schema.role = "admin"
            else:
                user_schema.role = "user"

        users_with_roles.append(user_schema)

    return users_with_roles
