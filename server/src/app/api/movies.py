from __future__ import annotations

from ninja import Router
from integrations.tmdb_client import tmdb_client

router = Router(tags=["movies"])


@router.get("/search")
def search_movies(request, query: str, limit: int = 10):
    limit = min(max(int(limit), 1), 25)
    results = tmdb_client.search_movies(query=query, limit=limit)
    return {"results": results}


@router.get("/{movie_id}")
def movie_detail(request, movie_id: int):
    return tmdb_client.movie_detail(movie_id=int(movie_id))
