from __future__ import annotations

import streamlit as st

from services.documents_service import DocumentsService


def render_documents_page(*, service: DocumentsService, user_key: str, tenant: str) -> None:
    st.header("📄 Documents")

    col_left, col_right = st.columns([1, 1], gap="large")

    with col_left:
        st.subheader("Create")
        title = st.text_input("Title", value="")
        content = st.text_area("Content", value="", height=160)

        create_disabled = not title.strip()
        if st.button("Create document", type="primary", disabled=create_disabled):
            created = service.create(user_key=user_key, tenant=tenant, title=title.strip(), content=content or "")
            st.success(f"Created: {created.id} — {created.title}")

        st.divider()
        st.subheader("Search")
        query = st.text_input("Search query", value="")
        limit = st.slider("Limit", min_value=1, max_value=25, value=10)

        if st.button("Search"):
            results = service.search(user_key=user_key, tenant=tenant, query=query, limit=limit)
            if not results:
                st.info("No results.")
            else:
                for d in results:
                    st.write(f"• **{d.id}** — {d.title}")

    with col_right:
        st.subheader("Recent")
        recent_limit = st.slider("Recent limit", min_value=1, max_value=25, value=10, key="recent_limit_docs")

        try:
            recent = service.list_recent(user_key=user_key, tenant=tenant, limit=recent_limit)
        except Exception as e:
            st.error(str(e))
            return

        if not recent:
            st.info("No documents yet.")
            return

        for d in recent:
            with st.expander(f"{d.id} — {d.title}", expanded=False):
                st.caption(f"Created: {d.created_at.isoformat() if getattr(d, 'created_at', None) else '—'}")
                if getattr(d, "content", None):
                    st.write(d.content)

                action_cols = st.columns([1, 1, 2])
                with action_cols[0]:
                    if st.button("Delete", key=f"delete_{d.id}"):
                        service.delete(user_key=user_key, tenant=tenant, document_id=int(d.id))
                        st.success("Deleted. Refresh the page to update.")
                with action_cols[1]:
                    if st.button("Open", key=f"open_{d.id}"):
                        full = service.get(user_key=user_key, tenant=tenant, document_id=int(d.id))
                        st.session_state["active_document"] = {
                            "id": full.id,
                            "title": full.title,
                            "content": full.content,
                        }

        active = st.session_state.get("active_document")
        if isinstance(active, dict) and active.get("id"):
            st.divider()
            st.subheader("Active document")
            st.write(f"**{active.get('id')} — {active.get('title', '')}**")
            st.write(active.get("content", ""))

            st.divider()
            st.subheader("Update")
            new_title = st.text_input("New title", value=str(active.get("title", "")), key="upd_title")
            new_content = st.text_area("New content", value=str(active.get("content", "")), height=160, key="upd_content")

            if st.button("Update document", type="secondary"):
                updated = service.update(
                    user_key=user_key,
                    tenant=tenant,
                    document_id=int(active["id"]),
                    title=new_title.strip(),
                    content=new_content,
                )
                st.session_state["active_document"] = {
                    "id": updated.id,
                    "title": updated.title,
                    "content": updated.content,
                }
                st.success("Updated.")
