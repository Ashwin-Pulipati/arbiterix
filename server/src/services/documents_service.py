from __future__ import annotations
from dataclasses import dataclass
from domain.auth.types import Identity
from domain.documents.schemas import DocumentCreate, DocumentOut
from repositories.documents_repo import DocumentsRepository
from integrations.authorizer import Authorizer

@dataclass(frozen=True)
class DocumentsService:
    repo: DocumentsRepository
    auth: Authorizer

    def list_recent(self, identity: Identity, owner_id: int, limit: int) -> list[DocumentOut]:
        if not self.auth.check(identity, "read", "document"):
            raise PermissionError("Forbidden")
        limit = min(max(limit, 1), 25)
        docs = self.repo.list_recent(owner_id=owner_id, limit=limit)
        return [DocumentOut.model_validate(d, from_attributes=True) for d in docs]

    def create(self, identity: Identity, owner_id: int, payload: DocumentCreate) -> DocumentOut:
        if not self.auth.check(identity, "create", "document"):
            raise PermissionError("Forbidden")
        doc = self.repo.create(owner_id=owner_id, title=payload.title, content=payload.content)
        return DocumentOut.model_validate(doc, from_attributes=True)

    def get(self, identity: Identity, owner_id: int, document_id: int) -> DocumentOut:
        if not self.auth.check(identity, "read", "document"):
            raise PermissionError("Forbidden")
        doc = self.repo.get(owner_id=owner_id, document_id=document_id)
        return DocumentOut.model_validate(doc, from_attributes=True)

    def delete(self, identity: Identity, owner_id: int, document_id: int) -> None:
        if not self.auth.check(identity, "delete", "document"):
            raise PermissionError("Forbidden")
        self.repo.soft_delete(owner_id=owner_id, document_id=document_id)

    def request_delete(self, identity: Identity, owner_id: int, document_id: int) -> DocumentOut:
        # Users who can read a document can request its deletion if they own it (enforced by repo)
        if not self.auth.check(identity, "read", "document"):
            raise PermissionError("Forbidden")
        doc = self.repo.request_delete(owner_id=owner_id, document_id=document_id)
        return DocumentOut.model_validate(doc, from_attributes=True)

    def undo_request_delete(self, identity: Identity, document_id: int) -> DocumentOut:
        doc = self.repo.undo_request_delete(document_id=document_id)
        return DocumentOut.model_validate(doc, from_attributes=True)