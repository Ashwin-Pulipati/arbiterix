from __future__ import annotations
from typing import Sequence
from django.db.models import Q
from documents.models import Document


class DocumentsRepository:
    def list_recent(self, owner_id: int | None, limit: int) -> Sequence[Document]:
        qs = Document.objects.filter(is_deleted=False)
        if owner_id is not None:
            qs = qs.filter(owner_id=owner_id)
        return qs.order_by("-created_at")[:limit]

    def search(self, owner_id: int | None, query: str, limit: int) -> Sequence[Document]:
        qs = Document.objects.filter(is_deleted=False)
        if owner_id is not None:
            qs = qs.filter(owner_id=owner_id)
            
        q = (query or "").strip()
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(content__icontains=q))
        return qs.order_by("-created_at")[:limit]

    def get(self, owner_id: int | None, document_id: int) -> Document:
        qs = Document.objects.filter(id=document_id, is_deleted=False)
        if owner_id is not None:
            qs = qs.filter(owner_id=owner_id)
        return qs.get()

    def create(self, owner_id: int, title: str, content: str | None) -> Document:
        return Document.objects.create(owner_id=owner_id, title=title, content=content)

    def soft_delete(self, owner_id: int | None, document_id: int) -> None:
        qs = Document.objects.filter(id=document_id, is_deleted=False)
        if owner_id is not None:
            qs = qs.filter(owner_id=owner_id)
        obj = qs.get()
        obj.soft_delete()

    def request_delete(self, owner_id: int, document_id: int) -> Document:
        obj = Document.objects.get(id=document_id, owner_id=owner_id, is_deleted=False)
        obj.delete_requested = True
        obj.save(update_fields=["delete_requested", "updated_at"])
        return obj

    def undo_request_delete(self, document_id: int) -> Document:
        obj = Document.objects.get(id=document_id, is_deleted=False)
        obj.delete_requested = False
        obj.save(update_fields=["delete_requested", "updated_at"])
        return obj