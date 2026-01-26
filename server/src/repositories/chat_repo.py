from typing import Sequence
from chat.models import ChatThread, ChatMessage

class ChatRepository:
    def list_threads(self, owner_id: int, limit: int = 20) -> Sequence[ChatThread]:
        return ChatThread.objects.filter(owner_id=owner_id).order_by("-updated_at")[:limit]

    def get_thread(self, owner_id: int, thread_id: int) -> ChatThread:
        return ChatThread.objects.get(id=thread_id, owner_id=owner_id)

    def get_thread_by_uuid(self, owner_id: int, uuid: str) -> ChatThread | None:
        return ChatThread.objects.filter(uuid=uuid, owner_id=owner_id).first()

    def get_messages(self, thread_id: int) -> Sequence[ChatMessage]:
        return ChatMessage.objects.filter(thread_id=thread_id).order_by("created_at")

    def create_thread(self, owner_id: int, title: str, uuid: str = None) -> ChatThread:
        return ChatThread.objects.create(owner_id=owner_id, title=title, uuid=uuid)

    def add_message(self, thread_id: int, role: str, content: str) -> ChatMessage:
        return ChatMessage.objects.create(thread_id=thread_id, role=role, content=content)

    def update_thread_title(self, owner_id: int, thread_id: int, title: str) -> ChatThread:
        thread = ChatThread.objects.get(id=thread_id, owner_id=owner_id)
        thread.title = title
        thread.save()
        return thread

    def update_message(self, owner_id: int, message_id: int, content: str) -> ChatMessage:
        message = ChatMessage.objects.get(id=message_id, thread__owner_id=owner_id)
        message.content = content
        message.save()
        return message

    def delete_thread(self, owner_id: int, thread_id: int) -> None:
        ChatThread.objects.filter(id=thread_id, owner_id=owner_id).delete()