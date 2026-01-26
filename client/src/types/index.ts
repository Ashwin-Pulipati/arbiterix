export interface Document {
  readonly id: number;
  readonly title: string;
  readonly content: string | null;
  readonly owner_id: number;
  readonly owner_username: string;
  readonly status: "created" | "updated" | "delete_requested";
  readonly delete_requested?: boolean;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface DocumentCreate {
  readonly title: string;
  readonly content: string;
}

export interface Movie {
  readonly id: number;
  readonly title: string;
  readonly overview: string;
  readonly release_date: string;
  readonly poster_path: string | null;
  readonly vote_average: number;
}

export interface ChatThread {
  readonly id: number;
  readonly uuid: string;
  readonly title: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "assistant" | "system";
  readonly content: string;
  readonly created_at?: string;
}

export interface ChatRequest {
  readonly message: string;
  readonly thread_id?: string;
  readonly agent: "Supervisor" | "Documents" | "Movies";
  readonly user_id: number;
  readonly tenant?: string;
}

export interface ChatResponse {
  readonly response: string;
  readonly thread_id: string;
}

export interface UserCreate {
  readonly username: string;
  readonly password: string;
  readonly role: "admin" | "user";
}

export interface User {
  readonly id: number;
  readonly username: string;
  readonly role: "admin" | "user";
  readonly tenant: string;
}
