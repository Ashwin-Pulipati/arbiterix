from __future__ import annotations
import uuid
from typing import Literal
from ninja import Router, Schema, Header
from ninja.errors import HttpError
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist

from ai import agents
from ai.supervisors import get_supervisor
from langchain_core.messages import HumanMessage

try:
    from langgraph.checkpoint.memory import MemorySaver
    CHECKPOINTER = MemorySaver()
except Exception:
    CHECKPOINTER = None

from domain.auth.types import Identity
from integrations.authorizer import Authorizer
from repositories.chat_repo import ChatRepository
from services.chat_service import ChatService
from domain.chat.schemas import ChatThreadOut, ChatMessageOut

router = Router(tags=["chat"])

_repo = ChatRepository()
_auth = Authorizer()
_svc = ChatService(repo=_repo, auth=_auth)
User = get_user_model()
_synced_users = set()

document_agent = agents.get_document_agent(checkpointer=CHECKPOINTER)
movie_agent = agents.get_movie_discovery_agent(checkpointer=CHECKPOINTER)
supervisor = get_supervisor(checkpointer=CHECKPOINTER)


def _identity_from_headers(
    user_id: int, 
    tenant: str | None, 
    role: str = "user", 
    username: str = "user"
) -> tuple[Identity, int]:
    tenant_key = (tenant or settings.PERMIT_TENANT_KEY or "default").strip() or "default"
    
    user, _ = User.objects.get_or_create(
        id=user_id,
        defaults={
            "username": username,
            "email": f"{username}@local.dev",
            "first_name": username
        }
    )
    
    sync_key = f"{user_id}:{role}:{tenant_key}"
    if sync_key not in _synced_users:
        try:
            _auth.sync_user(user_key=str(user_id), email=f"{username}@local.dev", first_name=username)
            if role == "admin":
                _auth.assign_admin(user_key=str(user_id))
            else:
                _auth.assign_user(user_key=str(user_id))
        except Exception as e:
            print(f"Auth Sync Error: {e}")
        _synced_users.add(sync_key)

    return Identity(user_key=str(user_id), tenant_key=tenant_key), int(user_id)


class ChatRequest(Schema):
    message: str
    thread_id: str | None = None
    agent: Literal["Supervisor", "Documents", "Movies"] = "Supervisor"
    user_id: int
    tenant: str | None = None


class ChatResponse(Schema):
    response: str
    thread_id: str


def _invoke_agent(compiled_agent, user_id: int, text: str, thread_id: str, tenant: str):
    cfg = {"configurable": {"user_id": user_id, "thread_id": thread_id, "tenant": tenant}}
    result = compiled_agent.invoke({"messages": [HumanMessage(content=text)]}, config=cfg)
    msgs = result.get("messages", [])
    if not msgs:
        return ""
    last = msgs[-1]
    return last.content if hasattr(last, "content") else str(last)


@router.get("/threads", response=list[ChatThreadOut])
def list_threads(
    request,
    limit: int = 20,
    x_user_id: int = Header(..., alias="X-User-Id"),
    x_tenant: str | None = Header(None, alias="X-Tenant"),
    x_user_role: str = Header("user", alias="X-User-Role"),
    x_user_name: str = Header("user", alias="X-User-Name"),
):
    try:
        identity, owner_id = _identity_from_headers(x_user_id, x_tenant, x_user_role, x_user_name)
        return _svc.list_threads(identity=identity, owner_id=owner_id)
    except PermissionError:
        raise HttpError(403, "Forbidden")
    except Exception as e:
        raise HttpError(500, str(e))


@router.get("/threads/{thread_id}/messages", response=list[ChatMessageOut])
def get_thread_messages(
    request,
    thread_id: str,
    x_user_id: int = Header(..., alias="X-User-Id"),
    x_tenant: str | None = Header(None, alias="X-Tenant"),
    x_user_role: str = Header("user", alias="X-User-Role"),
    x_user_name: str = Header("user", alias="X-User-Name"),
):
    try:
        identity, owner_id = _identity_from_headers(x_user_id, x_tenant, x_user_role, x_user_name)
        return _svc.get_thread_messages(identity=identity, owner_id=owner_id, thread_uuid=thread_id)
    except PermissionError:
        raise HttpError(403, "Forbidden")
    except Exception as e:
        raise HttpError(500, str(e))


@router.delete("/threads/{thread_id}")
def delete_thread(
    request,
    thread_id: int,
    x_user_id: int = Header(..., alias="X-User-Id"),
    x_tenant: str | None = Header(None, alias="X-Tenant"),
    x_user_role: str = Header("user", alias="X-User-Role"),
    x_user_name: str = Header("user", alias="X-User-Name"),
):
    try:
        identity, owner_id = _identity_from_headers(x_user_id, x_tenant, x_user_role, x_user_name)
        _svc.delete_thread(identity=identity, owner_id=owner_id, thread_id=thread_id)
        return {"message": "success"}
    except PermissionError:
        raise HttpError(403, "Forbidden")
    except Exception as e:
        raise HttpError(500, str(e))


@router.post("/", response=ChatResponse)
def chat(
    request, 
    payload: ChatRequest,
    x_user_id: int = Header(..., alias="X-User-Id"),
    x_tenant: str | None = Header(None, alias="X-Tenant"),
    x_user_role: str = Header("user", alias="X-User-Role"),
    x_user_name: str = Header("user", alias="X-User-Name"),
):
    try:
        _, owner_id = _identity_from_headers(x_user_id, x_tenant, x_user_role, x_user_name)

        thread_id = payload.thread_id or str(uuid.uuid4())
        tenant = payload.tenant or settings.PERMIT_TENANT_KEY or "default"
       
        db_thread = _repo.get_thread_by_uuid(owner_id=owner_id, uuid=thread_id)
        if not db_thread:
            title = payload.message[:30] + "..." if len(payload.message) > 30 else payload.message
            db_thread = _repo.create_thread(owner_id=owner_id, title=title, uuid=thread_id)
        else:
            db_thread.save()
        
        _repo.add_message(thread_id=db_thread.id, role="user", content=payload.message)
        
        if payload.agent == "Documents":
            agent = document_agent
        elif payload.agent == "Movies":
            agent = movie_agent
        else:
            agent = supervisor
       
        response_text = _invoke_agent(agent, owner_id, payload.message, thread_id, tenant)
        
        _repo.add_message(thread_id=db_thread.id, role="assistant", content=response_text)
        
        return ChatResponse(response=response_text, thread_id=thread_id)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HttpError(500, str(e))