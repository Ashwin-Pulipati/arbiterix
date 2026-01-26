"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { ChatThread } from "@/types";
import { useAsyncFn } from "react-use";
import { api } from "@/lib/api";
import { useUser } from "./user-provider";

interface ChatContextType {
  threads: ChatThread[];
  loading: boolean;
  refetch: () => Promise<ChatThread[] | undefined>;
  deleteThread: (id: number) => Promise<void>;
  updateThread: (id: number, title: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { readonly children: React.ReactNode }) {
  const { user } = useUser();

  const [state, fetchThreads] = useAsyncFn(async () => {
    if (!user) return [];
    return api.chat.listThreads(user);
  }, [user]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const deleteThread = async (id: number) => {
    if (!user) return;
    await api.chat.deleteThread(id, user);
    fetchThreads();
  };

  const updateThread = async (id: number, title: string) => {
    if (!user) return;
    await api.chat.updateThread(id, title, user);
    fetchThreads();
  };

  const value = useMemo(() => ({
    threads: state.value || [],
    loading: state.loading || state.value === undefined,
    refetch: fetchThreads,
    deleteThread,
    updateThread,
  }), [state.value, state.loading, fetchThreads, deleteThread, updateThread]);

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
