from __future__ import annotations

from ninja import Router, Header
from ninja.errors import HttpError
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

from domain.auth.types import Identity
from domain.documents.schemas import DocumentCreate, DocumentUpdate, DocumentOut
from repositories.documents_repo import DocumentsRepository
from integrations.authorizer import Authorizer
from services.documents_service import DocumentsService

router = Router(tags=["documents"])

_repo = DocumentsRepository()
_auth = Authorizer()
_svc = DocumentsService(repo=_repo, auth=_auth)

User = get_user_model()


_synced_users = set()

def _identity_from_headers(
    user_id: int, 
    tenant: str | None, 
    role: str = "user", 
    username: str = "user"
) -> tuple[Identity, int]:
    tenant_key = (tenant or settings.PERMIT_TENANT_KEY or "default").strip() or "default"
    
    # Ensure user exists in Django DB (for FK constraints)
    user, _ = User.objects.get_or_create(
        id=user_id,
        defaults={
            "username": username,
            "email": f"{username}@local.dev",
            "first_name": username
        }
    )
    
    # Simple in-memory cache to avoid excessive API calls to Permit
    sync_key = f"{user_id}:{role}:{tenant_key}"
    if sync_key not in _synced_users:
        # Sync user to Permit
        email = f"{username}@local.dev"
        _auth.sync_user(user_key=str(user_id), email=email, first_name=username)
        
        # Assign role
        if role == "admin":
            _auth.assign_admin(user_key=str(user_id))
        else:
            _auth.assign_user(user_key=str(user_id))
            
        _synced_users.add(sync_key)

    return Identity(user_key=str(user_id), tenant_key=tenant_key), int(user_id)


@router.get("/", response=list[DocumentOut])
def list_documents(
    request,
    limit: int = 10,
    x_user_id: int = Header(..., alias="X-User-Id"),
    x_tenant: str | None = Header(None, alias="X-Tenant"),
    x_user_role: str = Header("user", alias="X-User-Role"),
    x_user_name: str = Header("user", alias="X-User-Name"),
):
    try:
        identity, owner_id = _identity_from_headers(x_user_id, x_tenant, x_user_role, x_user_name)
        target_owner_id = None if x_user_role == "admin" else owner_id
        return _svc.list_recent(identity=identity, owner_id=target_owner_id, limit=limit)
    except PermissionError:
        raise HttpError(403, "Forbidden")
    except Exception as e:
        raise HttpError(500, str(e))


@router.get("/{document_id}", response=DocumentOut)
def get_document(
    request,
    document_id: int,
    x_user_id: int = Header(..., alias="X-User-Id"),
    x_tenant: str | None = Header(None, alias="X-Tenant"),
    x_user_role: str = Header("user", alias="X-User-Role"),
    x_user_name: str = Header("user", alias="X-User-Name"),
):
    try:
        identity, owner_id = _identity_from_headers(x_user_id, x_tenant, x_user_role, x_user_name)
        target_owner_id = None if x_user_role == "admin" else owner_id
        return _svc.get(identity=identity, owner_id=target_owner_id, document_id=document_id)
    except PermissionError:
        raise HttpError(403, "Forbidden")
    except ObjectDoesNotExist:
        raise HttpError(404, "Document not found")
    except Exception as e:
        raise HttpError(500, str(e))


@router.post("/", response=DocumentOut)
def create_document(
    request,
    payload: DocumentCreate,
    x_user_id: int = Header(..., alias="X-User-Id"),
    x_tenant: str | None = Header(None, alias="X-Tenant"),
    x_user_role: str = Header("user", alias="X-User-Role"),
    x_user_name: str = Header("user", alias="X-User-Name"),
):
    try:
        identity, owner_id = _identity_from_headers(x_user_id, x_tenant, x_user_role, x_user_name)
        return _svc.create(identity=identity, owner_id=owner_id, payload=payload)
    except PermissionError:
        raise HttpError(403, "Forbidden")
    except Exception as e:
        raise HttpError(500, str(e))


@router.put("/{document_id}", response=DocumentOut)
def update_document(
    request,
    document_id: int,
    payload: DocumentUpdate,
    x_user_id: int = Header(..., alias="X-User-Id"),
    x_tenant: str | None = Header(None, alias="X-Tenant"),
    x_user_role: str = Header("user", alias="X-User-Role"),
    x_user_name: str = Header("user", alias="X-User-Name"),
):
    try:
        identity, owner_id = _identity_from_headers(x_user_id, x_tenant, x_user_role, x_user_name)
        target_owner_id = None if x_user_role == "admin" else owner_id
        
        if not _auth.check(identity, "read", "document"):
            raise HttpError(403, "Forbidden")

        doc = _repo.get(owner_id=target_owner_id, document_id=document_id)
        if payload.title is not None:
            doc.title = payload.title
        if payload.content is not None:
            doc.content = payload.content
        doc.save()

        return DocumentOut.model_validate(doc, from_attributes=True)
    except PermissionError:
        raise HttpError(403, "Forbidden")
    except ObjectDoesNotExist:
        raise HttpError(404, "Document not found")
    except Exception as e:
        raise HttpError(500, str(e))


@router.delete("/{document_id}")
def delete_document(
    request,
    document_id: int,
    x_user_id: int = Header(..., alias="X-User-Id"),
    x_tenant: str | None = Header(None, alias="X-Tenant"),
    x_user_role: str = Header("user", alias="X-User-Role"),
    x_user_name: str = Header("user", alias="X-User-Name"),
):
    try:
        identity, owner_id = _identity_from_headers(x_user_id, x_tenant, x_user_role, x_user_name)
        target_owner_id = None if x_user_role == "admin" else owner_id
        _svc.delete(identity=identity, owner_id=target_owner_id, document_id=document_id)
        return {"message": "success"}
    except PermissionError:
        raise HttpError(403, "Forbidden")
    except ObjectDoesNotExist:
        raise HttpError(404, "Document not found")
    except Exception as e:
        raise HttpError(500, str(e))

@router.post("/{document_id}/request-delete", response=DocumentOut)
def request_delete_document(
    request,
    document_id: int,
    x_user_id: int = Header(..., alias="X-User-Id"),
    x_tenant: str | None = Header(None, alias="X-Tenant"),
    x_user_role: str = Header("user", alias="X-User-Role"),
    x_user_name: str = Header("user", alias="X-User-Name"),
):
    try:
        identity, owner_id = _identity_from_headers(x_user_id, x_tenant, x_user_role, x_user_name)
        return _svc.request_delete(identity=identity, owner_id=owner_id, document_id=document_id)
    except PermissionError:
        raise HttpError(403, "Forbidden")
    except ObjectDoesNotExist:
        raise HttpError(404, "Document not found")
    except Exception as e:
        raise HttpError(500, str(e))

@router.post("/{document_id}/undo-request-delete", response=DocumentOut)
def undo_request_delete_document(
    request,
    document_id: int,
    x_user_id: int = Header(..., alias="X-User-Id"),
    x_tenant: str | None = Header(None, alias="X-Tenant"),
    x_user_role: str = Header("user", alias="X-User-Role"),
    x_user_name: str = Header("user", alias="X-User-Name"),
):
    try:
        if x_user_role != "admin":
            raise HttpError(403, "Forbidden")
        identity, _ = _identity_from_headers(x_user_id, x_tenant, x_user_role, x_user_name)
        return _svc.undo_request_delete(identity=identity, document_id=document_id)
    except PermissionError:
        raise HttpError(403, "Forbidden")
    except ObjectDoesNotExist:
        raise HttpError(404, "Document not found")
    except Exception as e:
        raise HttpError(500, str(e))