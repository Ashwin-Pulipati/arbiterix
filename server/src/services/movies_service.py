from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping, Sequence

from integrations.tmdb_client import TmdbClient


@dataclass(frozen=True, slots=True)
class MovieSummary:
    id: int
    title: str
    overview: str | None
    release_date: str | None
    vote_average: float | None
    poster_path: str | None


@dataclass(frozen=True, slots=True)
class MovieDetail:
    id: int
    title: str
    overview: str | None
    release_date: str | None
    vote_average: float | None
    runtime: int | None
    genres: tuple[str, ...]
    poster_path: str | None
    homepage: str | None


def _as_str(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        s = value.strip()
        return s if s else None
    return str(value)


def _as_int(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except Exception:
        return None


def _as_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except Exception:
        return None


def _get(mapping: Mapping[str, Any], key: str) -> Any:
    return mapping.get(key)


class MoviesService:
    __slots__ = ("_client",)

    def __init__(self, client: TmdbClient) -> None:
        self._client = client

    def search(self, query: str, limit: int = 5) -> tuple[MovieSummary, ...]:
        clean_query = query.strip()
        if not clean_query:
            return ()
        safe_limit = max(1, min(int(limit), 25))

        raw = self._client.search_movies(query=clean_query, limit=safe_limit)
        return tuple(self._to_summary(item) for item in raw)

    def detail(self, movie_id: int) -> MovieDetail:
        raw = self._client.movie_detail(movie_id=int(movie_id))
        return self._to_detail(raw)

    def _to_summary(self, item: Mapping[str, Any]) -> MovieSummary:
        return MovieSummary(
            id=int(_get(item, "id")),
            title=_as_str(_get(item, "title")) or _as_str(_get(item, "name")) or "Untitled",
            overview=_as_str(_get(item, "overview")),
            release_date=_as_str(_get(item, "release_date")) or _as_str(_get(item, "first_air_date")),
            vote_average=_as_float(_get(item, "vote_average")),
            poster_path=_as_str(_get(item, "poster_path")),
        )

    def _to_detail(self, item: Mapping[str, Any]) -> MovieDetail:
        genres_raw = _get(item, "genres")
        genres: tuple[str, ...]
        if isinstance(genres_raw, Sequence):
            names: list[str] = []
            for g in genres_raw:
                if isinstance(g, Mapping):
                    n = _as_str(g.get("name"))
                    if n:
                        names.append(n)
            genres = tuple(names)
        else:
            genres = ()

        return MovieDetail(
            id=int(_get(item, "id")),
            title=_as_str(_get(item, "title")) or _as_str(_get(item, "name")) or "Untitled",
            overview=_as_str(_get(item, "overview")),
            release_date=_as_str(_get(item, "release_date")) or _as_str(_get(item, "first_air_date")),
            vote_average=_as_float(_get(item, "vote_average")),
            runtime=_as_int(_get(item, "runtime")),
            genres=genres,
            poster_path=_as_str(_get(item, "poster_path")),
            homepage=_as_str(_get(item, "homepage")),
        )
