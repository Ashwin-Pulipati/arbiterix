from __future__ import annotations

import streamlit as st

from services.movies_service import MoviesService


def _poster_url(path: str | None) -> str | None:
    if not path:
        return None
    clean = path.strip()
    if not clean:
        return None
    if clean.startswith("http"):
        return clean
    return f"https://image.tmdb.org/t/p/w342{clean}"


def render_movies_page(*, service: MoviesService) -> None:
    st.header("🎬 Movies")

    query = st.text_input("Search", value="Inception")
    limit = st.slider("Limit", min_value=1, max_value=25, value=10)

    if st.button("Search movies", type="primary"):
        results = service.search(query=query, limit=limit)
        st.session_state["movie_search_results"] = [r.__dict__ for r in results]

    results_raw = st.session_state.get("movie_search_results")
    if not results_raw:
        st.info("Search for a movie to see results.")
        return

    results = results_raw if isinstance(results_raw, list) else []
    for item in results:
        movie_id = int(item["id"])
        title = str(item.get("title") or "Untitled")
        release_date = item.get("release_date") or "—"
        rating = item.get("vote_average")
        rating_str = f"{float(rating):.1f}" if isinstance(rating, (int, float)) else "—"

        with st.expander(f"{title} ({release_date}) • ⭐ {rating_str}", expanded=False):
            cols = st.columns([1, 3], gap="large")
            with cols[0]:
                poster = _poster_url(item.get("poster_path"))
                if poster:
                    st.image(poster)
            with cols[1]:
                overview = item.get("overview") or ""
                if overview:
                    st.write(overview)

                if st.button("View details", key=f"movie_detail_{movie_id}"):
                    detail = service.detail(movie_id=movie_id)
                    st.session_state["active_movie_detail"] = detail.__dict__

    active = st.session_state.get("active_movie_detail")
    if isinstance(active, dict) and active.get("id"):
        st.divider()
        st.subheader("Movie detail")

        cols = st.columns([1, 3], gap="large")
        with cols[0]:
            poster = _poster_url(active.get("poster_path"))
            if poster:
                st.image(poster)

        with cols[1]:
            st.write(f"**{active.get('title', 'Untitled')}**")
            st.write(f"Release: {active.get('release_date') or '—'}")
            runtime = active.get("runtime")
            if isinstance(runtime, int) and runtime > 0:
                st.write(f"Runtime: {runtime} min")
            rating = active.get("vote_average")
            if isinstance(rating, (int, float)):
                st.write(f"Rating: {float(rating):.1f}")

            genres = active.get("genres") or ()
            if isinstance(genres, (list, tuple)) and genres:
                st.write("Genres: " + ", ".join(str(g) for g in genres))

            overview = active.get("overview")
            if overview:
                st.write(overview)

            homepage = active.get("homepage")
            if isinstance(homepage, str) and homepage.strip():
                st.link_button("Open homepage", homepage.strip())