import type {
  ChatRequest,
  ChatResponse,
  ChatThread,
  ChatMessage,
  Document,
  DocumentCreate,
  Movie,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export type ApiUserHeaders = {
  id: number;
  tenant: string;
  role: string;
  username: string;
};

type ApiErrorShape = { detail?: string; message?: string; error?: string };

export class ApiError extends Error {
  readonly status: number;
  readonly payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  user?: ApiUserHeaders;
  signal?: AbortSignal;
};

async function parseJsonSafe(res: Response): Promise<unknown> {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return undefined;
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

function buildHeaders(user?: ApiUserHeaders, extra?: Record<string, string>) {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (user) {
    h["X-User-Id"] = String(user.id);
    h["X-Tenant"] = user.tenant;
    h["X-User-Role"] = user.role;
    h["X-User-Name"] = user.username;
  }
  return { ...h, ...(extra || {}) };
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options.user, options.headers),
  });

  if (!res.ok) {
    const payload = await parseJsonSafe(res);
    const e = (payload || {}) as ApiErrorShape;
    const msg =
      e.detail ||
      e.message ||
      e.error ||
      `API Error: ${res.status} ${res.statusText}`;
    throw new ApiError(res.status, msg, payload);
  }

  return (await parseJsonSafe(res)) as T;
}

export const api = {
  documents: {
    list: (user: ApiUserHeaders, signal?: AbortSignal) =>
      fetchAPI<Document[]>("/documents/", { user, signal }),
    get: (id: number, user: ApiUserHeaders, signal?: AbortSignal) =>
      fetchAPI<Document>(`/documents/${id}`, { user, signal }),
    create: (
      data: DocumentCreate,
      user: ApiUserHeaders,
      signal?: AbortSignal
    ) =>
      fetchAPI<Document>("/documents/", {
        method: "POST",
        body: JSON.stringify(data),
        user,
        signal,
      }),
    update: (
      id: number,
      data: Partial<DocumentCreate>,
      user: ApiUserHeaders,
      signal?: AbortSignal
    ) =>
      fetchAPI<Document>(`/documents/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        user,
        signal,
      }),
    delete: (id: number, user: ApiUserHeaders, signal?: AbortSignal) =>
      fetchAPI<{ message: string }>(`/documents/${id}`, {
        method: "DELETE",
        user,
        signal,
      }),
    requestDelete: (id: number, user: ApiUserHeaders, signal?: AbortSignal) =>
      fetchAPI<Document>(`/documents/${id}/request-delete`, {
        method: "POST",
        user,
        signal,
      }),
    undoRequestDelete: (
      id: number,
      user: ApiUserHeaders,
      signal?: AbortSignal
    ) =>
      fetchAPI<Document>(`/documents/${id}/undo-request-delete`, {
        method: "POST",
        user,
        signal,
      }),
  },

  movies: {
    search: (query: string, limit = 20, signal?: AbortSignal) =>
      fetchAPI<{ results: Movie[] }>(
        `/movies/search?query=${encodeURIComponent(query)}&limit=${limit}`,
        { signal }
      ),
    get: (id: number, signal?: AbortSignal) =>
      fetchAPI<Movie>(`/movies/${id}`, { signal }),
  },

  chat: {
    listThreads: (user: ApiUserHeaders, signal?: AbortSignal) =>
      fetchAPI<ChatThread[]>("/chat/threads", { user, signal }),
    getThreadMessages: (threadId: string, user: ApiUserHeaders, signal?: AbortSignal) =>
      fetchAPI<ChatMessage[]>(`/chat/threads/${threadId}/messages`, { user, signal }),
    deleteThread: (id: number, user: ApiUserHeaders, signal?: AbortSignal) =>
      fetchAPI<{ message: string }>(`/chat/threads/${id}`, {
        method: "DELETE",
        user,
        signal,
      }),
    send: (data: ChatRequest, user: ApiUserHeaders, signal?: AbortSignal) =>
      fetchAPI<ChatResponse>("/chat/", {
        method: "POST",
        body: JSON.stringify(data),
        user,
        signal,
      }),
  },
};
