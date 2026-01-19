from __future__ import annotations

from ninja import NinjaAPI

from app.api.documents import router as documents_router
from app.api.movies import router as movies_router
from app.api.chat import router as chat_router
from app.api.users import router as users_router

api = NinjaAPI(title="AgenticAI API", version="1.0.0")

api.add_router("/documents", documents_router)
api.add_router("/movies", movies_router)
api.add_router("/chat", chat_router)
api.add_router("/users", users_router)
