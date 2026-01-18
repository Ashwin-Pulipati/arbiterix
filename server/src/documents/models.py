from __future__ import annotations
from django.conf import settings
from django.db import models
from django.utils import timezone
from datetime import timedelta

User = settings.AUTH_USER_MODEL

class Document(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    content = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    delete_requested = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def soft_delete(self) -> None:
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_deleted", "deleted_at", "updated_at"])

    @property
    def owner_username(self) -> str:
        return self.owner.username

    @property
    def status(self) -> str:
        if self.delete_requested:
            return "delete_requested"
        if self.updated_at and self.created_at and (self.updated_at - self.created_at) > timedelta(seconds=1):
            return "updated"
        return "created"

    def __str__(self) -> str:
        return self.title