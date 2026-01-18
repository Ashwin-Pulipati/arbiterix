from __future__ import annotations
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from domain.auth.types import Identity
from domain.documents.schemas import DocumentCreate
from integrations.authorizer import Authorizer
from repositories.documents_repo import DocumentsRepository
from services.documents_service import DocumentsService

_repo = DocumentsRepository()
_auth = Authorizer()
_svc = DocumentsService(repo=_repo, auth=_auth)

def _ctx(config: RunnableConfig) -> tuple[Identity, int]:
    cfg = (config.get("configurable") or config.get("metadata") or {})
    user_id = cfg.get("user_id")
    tenant = cfg.get("tenant") or "default"
    if user_id is None:
        raise ValueError("Missing user_id")
    return Identity(user_key=str(user_id), tenant_key=str(tenant)), int(user_id)

@tool
def list_documents(limit: int = 5, config: RunnableConfig = {}):
    """List recent documents for the current user."""
    _, owner_id = _ctx(config)
    docs = _repo.list_recent(owner_id=owner_id, limit=limit)
    return [{"id": d.id, "title": d.title} for d in docs]

@tool
def create_document(title: str, content: str | None = None, config: RunnableConfig = {}):
    """Create a new document for the current user."""
    _, owner_id = _ctx(config)
    d = _repo.create(owner_id=owner_id, title=title, content=content)
    return {"id": d.id, "title": d.title, "content": d.content, "status": d.status}

@tool
def get_document(document_id: int, config: RunnableConfig = {}):
    """Retrieve a specific document by its ID."""
    _, owner_id = _ctx(config)
    d = _repo.get(owner_id=owner_id, document_id=document_id)
    return {"id": d.id, "title": d.title, "content": d.content, "status": d.status}

@tool
def delete_document(document_id: int, config: RunnableConfig = {}):
    """Delete a specific document by its ID."""
    _, owner_id = _ctx(config)
    _repo.soft_delete(owner_id=owner_id, document_id=document_id)
    return {"message": "success"}

document_tools = [create_document, list_documents, get_document, delete_document]
