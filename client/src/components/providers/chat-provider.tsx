"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { ChatThread } from "@/types";
import { api } from "@/lib/api";
import { useUser } from "./user-provider";

interface ChatContextType {
  threads: ChatThread[];
  loading: boolean;
  refetch: () => Promise<void>;
  deleteThread: (id: number) => Promise<void>;
  updateThread: (id: number, title: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { readonly children: React.ReactNode }) {
  const { user } = useUser();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.chat.listThreads(user);
      setThreads(data);
    } catch (e) {
      console.error("Failed to fetch threads", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const deleteThread = async (id: number) => {
    if (!user) return;
    // Optimistic update
    setThreads((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.chat.deleteThread(id, user);
    } catch (e) {
      // Revert if failed
      console.error("Failed to delete thread", e);
      fetchThreads(); 
    }
  };

  const updateThread = async (id: number, title: string) => {
    if (!user) return;
    // Optimistic update
    setThreads((prev) => prev.map(t => t.id === id ? { ...t, title } : t));
    try {
      await api.chat.updateThread(id, title, user);
    } catch (e) {
      console.error("Failed to update thread", e);
      fetchThreads();
    }
  };

  const value = useMemo(() => ({
    threads,
    loading,
    refetch: fetchThreads,
    deleteThread,
    updateThread,
  }), [threads, loading, fetchThreads]); // removed deleteThread, updateThread from deps as they are stable closures if we ignore internal deps? No, they use user/fetchThreads.

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChatHistory = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatHistory must be used within a ChatProvider");
  }
  return context;
};
