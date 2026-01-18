from __future__ import annotations
import os
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore", message=".*async_to_sync was passed a non-async-marked callable.*")

sys.path.append(str(Path(__file__).resolve().parent.parent))

import uuid
import streamlit as st
from app.django_bootstrap import bootstrap
bootstrap()

from django.contrib.auth import get_user_model
from django.conf import settings
from asgiref.sync import async_to_sync

from integrations.permit_bootstrap import PermitBootstrapper
from integrations.authorizer import Authorizer
from ai import agents
from ai.supervisors import get_supervisor
from langchain_core.messages import HumanMessage

try:
    from langgraph.checkpoint.memory import MemorySaver
    CHECKPOINTER = MemorySaver()
except Exception:
    CHECKPOINTER = None

auth = Authorizer()

def invoke_agent(compiled_agent, user_id: int, text: str, thread_id: str):
    cfg = {"configurable": {"user_id": user_id, "thread_id": thread_id, "tenant": settings.PERMIT_TENANT_KEY}}
    result = compiled_agent.invoke({"messages": [HumanMessage(content=text)]}, config=cfg)
    msgs = result.get("messages", [])
    if not msgs:
        return ""
    last = msgs[-1]
    return last.content if hasattr(last, "content") else str(last)

def ensure_user(username: str):
    User = get_user_model()
    user, _ = User.objects.get_or_create(username=username, defaults={"email": f"{username}@local.dev"})
    return user

def ensure_permit_once(user_id: int, email: str, first_name: str, role: str = "user") -> None:
    if not st.session_state.get("permit_bootstrapped_v4"):
        PermitBootstrapper().bootstrap()
        st.session_state["permit_bootstrapped_v4"] = True
    
    user_sync_key = f"permit_synced_{user_id}"
    if not st.session_state.get(user_sync_key):
        auth.sync_user(user_key=str(user_id), email=email, first_name=first_name)
        if role == "admin":
            auth.assign_admin(user_key=str(user_id))
        else:
            auth.assign_user(user_key=str(user_id))
        st.session_state[user_sync_key] = True

st.set_page_config(page_title="AgenticAI", page_icon="🤖", layout="wide")
st.title("🤖 AgenticAI")
st.caption("Secure documents + movie discovery")

with st.sidebar:
    st.subheader("Runtime")
    st.write(f"Django: `{os.environ.get('DJANGO_SETTINGS_MODULE')}`")
    st.write(f"Permit tenant: `{settings.PERMIT_TENANT_KEY}`")
    st.write(f"Permit role: `{settings.PERMIT_ADMIN_ROLE_KEY}`")
    st.write(f"OpenAI: `{bool(settings.OPENAI_API_KEY)}`")
    st.write(f"TMDB: `{bool(settings.TMDB_API_KEY) or bool(settings.TMDB_ACCESS_TOKEN)}`")
    st.write(f"Permit: `{bool(settings.PERMIT_API_KEY)}`")

    st.divider()
    username = st.text_input("Username", value="demo")
    user = ensure_user(username)
   
    if username.lower() in ["admin", "ashwin", "ashwi"]:
        role = "admin"
    else:
        role = "user"
        
    ensure_permit_once(user_id=user.id, email=user.email, first_name=user.username, role=role)
    st.write(f"User ID: **{user.id}**")
    st.write(f"Role: **{role.capitalize()}**")

    if "thread_id" not in st.session_state:
        st.session_state["thread_id"] = str(uuid.uuid4())
    st.caption(st.session_state["thread_id"])

    st.divider()
    mode = st.radio("Mode", ["Chat", "Documents", "Movies", "Permit Diagnostics"], index=0)

    if mode == "Chat":
        st.divider()
        agent_choice = st.selectbox("Specialist Agent", ["Supervisor", "Documents", "Movies"], index=0)
    else:
        agent_choice = None

document_agent = agents.get_document_agent(checkpointer=CHECKPOINTER)
movie_agent = agents.get_movie_discovery_agent(checkpointer=CHECKPOINTER)
supervisor = get_supervisor(checkpointer=CHECKPOINTER)

if mode == "Permit Diagnostics":
    from domain.auth.types import Identity
    identity = Identity(user_key=str(user.id), tenant_key=settings.PERMIT_TENANT_KEY)
    st.write("read document:", auth.check(identity, "read", "document"))
    st.write("create document:", auth.check(identity, "create", "document"))
    st.write("delete document:", auth.check(identity, "delete", "document"))

elif mode == "Chat":
    if "chat_messages" not in st.session_state:
        st.session_state["chat_messages"] = []

    for m in st.session_state["chat_messages"]:
        with st.chat_message(m["role"]):
            st.markdown(m["content"])

    prompt = st.chat_input("Type...")
    if prompt:
        st.session_state["chat_messages"].append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            tid = st.session_state["thread_id"]
            if agent_choice == "Documents":
                reply = invoke_agent(document_agent, user.id, prompt, tid)
            elif agent_choice == "Movies":
                reply = invoke_agent(movie_agent, user.id, prompt, tid)
            else:
                reply = invoke_agent(supervisor, user.id, prompt, tid)
            st.markdown(reply)
            st.session_state["chat_messages"].append({"role": "assistant", "content": reply})

elif mode == "Documents":
    st.write("Use Chat mode with: `Create a document titled ...` or `List my documents`")

else:
    st.write("Use Chat mode with: `Search movies for Inception`")
