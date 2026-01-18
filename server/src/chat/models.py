from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL

class ChatThread(models.Model):
    uuid = models.CharField(max_length=100, unique=True, null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_threads")
    title = models.CharField(max_length=255, default="New Chat")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.id})"

class ChatMessage(models.Model):
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=50)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."
