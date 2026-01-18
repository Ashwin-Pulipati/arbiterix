from __future__ import annotations
from dataclasses import dataclass
from django.conf import settings
import requests


@dataclass(frozen=True)
class TmdbClient:
    session: requests.Session

    def _auth(self) -> tuple[dict[str, str], dict[str, str]]:
        headers: dict[str, str] = {"accept": "application/json"}
        params: dict[str, str] = {}
        if settings.TMDB_ACCESS_TOKEN:
            headers["Authorization"] = f"Bearer {settings.TMDB_ACCESS_TOKEN}"
        elif settings.TMDB_API_KEY:
            params["api_key"] = settings.TMDB_API_KEY
        return headers, params

    def search_movie(self, query: str, limit: int) -> list[dict]:
        url = "https://api.themoviedb.org/3/search/movie"
        headers, params = self._auth()
        resp = self.session.get(
            url,
            headers=headers,
            params={**params, "query": query, "include_adult": "false"},
            timeout=30,
        )
        data = resp.json()
        results = data.get("results") or []
        return results[:limit]
   
    def search_movies(self, query: str, limit: int) -> list[dict]:
        return self.search_movie(query=query, limit=limit)

    def movie_detail(self, movie_id: int) -> dict:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}"
        headers, params = self._auth()
        resp = self.session.get(url, headers=headers, params=params, timeout=30)
        return resp.json()


tmdb_client = TmdbClient(session=requests.Session())
