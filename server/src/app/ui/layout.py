from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import streamlit as st


PageKey = Literal["Documents", "Movies", "Chat"]


@dataclass(frozen=True, slots=True)
class AppContext:
    user_key: str
    username: str
    tenant: str
    page: PageKey


def render_layout(*, app_title: str = "AgenticAI") -> AppContext:
    st.set_page_config(page_title=app_title, page_icon="🤖", layout="wide")

    with st.sidebar:
        st.title("🤖 " + app_title)

        st.subheader("Identity")
        tenant = st.text_input("Tenant", value=st.session_state.get("tenant", "default")).strip() or "default"
        username = st.text_input("Username", value=st.session_state.get("username", "demo")).strip() or "demo"

        user_key = st.session_state.get("user_key")
        if not user_key:
            user_key = username
        user_key = st.text_input("User Key", value=user_key).strip() or username

        st.session_state["tenant"] = tenant
        st.session_state["username"] = username
        st.session_state["user_key"] = user_key

        st.divider()
        st.subheader("Navigation")
        page: PageKey = st.radio("Go to", options=["Documents", "Movies", "Chat"], index=0, horizontal=True)  

    return AppContext(user_key=user_key, username=username, tenant=tenant, page=page)
