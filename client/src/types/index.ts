export interface Document {
  id: number;
  title: string;
  content: string | null;
  owner_id: number;
  owner_username: string;
  status: "created" | "updated" | "delete_requested";
  delete_requested?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentCreate {
  title: string;
  content: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
}

export interface ChatThread {
  id: number;
  uuid: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
}

export interface ChatRequest {
  message: string;
  thread_id?: string;
  agent: "Supervisor" | "Documents" | "Movies";
  user_id: number;
  tenant?: string;
}

export interface ChatResponse {
  response: string;
  thread_id: string;
}

export interface UserCreate {
  username: string;
  password: string;
  role: "admin" | "user";
}

export interface User {
  id: number;
  username: string;
  role: "admin" | "user";
  tenant: string;
}
