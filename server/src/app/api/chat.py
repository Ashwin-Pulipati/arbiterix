from __future__ import annotations
import uuid
from typing import Literal
from ninja import Router, Schema
from django.conf import settings
from ai import agents
from ai.supervisors import get_supervisor
from langchain_core.messages import HumanMessage

try:
    from langgraph.checkpoint.memory import MemorySaver
    CHECKPOINTER = MemorySaver()
except Exception:
    CHECKPOINTER = None

router = Router(tags=["chat"])

# Initialize agents (globals, similar to streamlit app)
# Note: In a production app, we might want to initialize these differently or use a dependency injection system,
# but for this scale, this matches the existing pattern.
document_agent = agents.get_document_agent(checkpointer=CHECKPOINTER)
movie_agent = agents.get_movie_discovery_agent(checkpointer=CHECKPOINTER)
supervisor = get_supervisor(checkpointer=CHECKPOINTER)


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
    # Depending on how the agents are set up, they might return a dict or a string.
    # The streamlit app expects {"messages": ...} input and returns a dict with "messages"
    result = compiled_agent.invoke({"messages": [HumanMessage(content=text)]}, config=cfg)
    
    # Extract response
    msgs = result.get("messages", [])
    if not msgs:
        return ""
    
    last = msgs[-1]
    return last.content if hasattr(last, "content") else str(last)


@router.post("/", response=ChatResponse)
def chat(request, payload: ChatRequest):
    thread_id = payload.thread_id or str(uuid.uuid4())
    tenant = payload.tenant or settings.PERMIT_TENANT_KEY or "default"
    
    if payload.agent == "Documents":
        agent = document_agent
    elif payload.agent == "Movies":
        agent = movie_agent
    else:
        agent = supervisor
        
    response_text = _invoke_agent(agent, payload.user_id, payload.message, thread_id, tenant)
    
    return ChatResponse(response=response_text, thread_id=thread_id)
