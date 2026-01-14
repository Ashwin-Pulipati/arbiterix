import { Document, DocumentCreate, Movie, ChatRequest, ChatResponse } from "@/types";

const API_BASE_URL = "http://127.0.0.1:8000/api";

interface FetchOptions extends RequestInit {
  userId?: number;
  tenant?: string;
  role?: string;
  username?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { userId, tenant, role, username, headers, ...rest } = options;
  
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (userId) {
    defaultHeaders["X-User-Id"] = userId.toString();
  }
  if (tenant) {
    defaultHeaders["X-Tenant"] = tenant;
  }
  if (role) {
    defaultHeaders["X-User-Role"] = role;
  }
  if (username) {
    defaultHeaders["X-User-Name"] = username;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { ...defaultHeaders, ...(headers as Record<string, string>) },
    ...rest,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  documents: {
    list: (user: { id: number; tenant: string; role: string; username: string }) => 
      fetchAPI<Document[]>("/documents/", { 
        userId: user.id, 
        tenant: user.tenant,
        role: user.role,
        username: user.username 
      }),
      
    get: (id: number, user: { id: number; tenant: string; role: string; username: string }) => 
      fetchAPI<Document>(`/documents/${id}`, { 
        userId: user.id, 
        tenant: user.tenant,
        role: user.role,
        username: user.username 
      }),
      
    create: (data: DocumentCreate, user: { id: number; tenant: string; role: string; username: string }) => 
      fetchAPI<Document>("/documents/", { 
        method: "POST", 
        body: JSON.stringify(data),
        userId: user.id, 
        tenant: user.tenant,
        role: user.role,
        username: user.username 
      }),

    update: (id: number, data: Partial<DocumentCreate>, user: { id: number; tenant: string; role: string; username: string }) => 
      fetchAPI<Document>(`/documents/${id}`, { 
        method: "PUT", 
        body: JSON.stringify(data),
        userId: user.id, 
        tenant: user.tenant,
        role: user.role,
        username: user.username 
      }),
      
    delete: (id: number, user: { id: number; tenant: string; role: string; username: string }) => 
      fetchAPI<{ message: string }>(`/documents/${id}`, { 
        method: "DELETE", 
        userId: user.id, 
        tenant: user.tenant,
        role: user.role,
        username: user.username 
      }),

    requestDelete: (id: number, user: { id: number; tenant: string; role: string; username: string }) => 
      fetchAPI<Document>(`/documents/${id}/request-delete`, { 
        method: "POST", 
        userId: user.id, 
        tenant: user.tenant,
        role: user.role,
        username: user.username 
      }),
  },
  
  movies: {
    search: (query: string) => 
      fetchAPI<{ results: Movie[] }>(`/movies/search?query=${encodeURIComponent(query)}&limit=20`),
      
    get: (id: number) => 
      fetchAPI<Movie>(`/movies/${id}`),
  },
  
  chat: {
    send: (data: ChatRequest) => 
      fetchAPI<ChatResponse>("/chat/", { 
        method: "POST", 
        body: JSON.stringify(data) 
      }),
  }
};
