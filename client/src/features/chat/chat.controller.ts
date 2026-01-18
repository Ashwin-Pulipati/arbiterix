"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { ApiUserHeaders } from "@/lib/api";
import type { ChatRequest, ChatResponse } from "@/types";
import { useAsyncFn, useNetworkState, useTitle } from "react-use";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type ChatAgent = "Supervisor" | "Documents" | "Movies";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent: ChatAgent | "System";
};

type UseChatControllerArgs = {
  user: ApiUserHeaders;
};

type ChatControllerState = {
  input: string;
  agent: ChatAgent;
  messages: ChatMessage[];
  loading: boolean;
  threadId?: string;
  online: boolean;
  canSend: boolean;
};

type ChatControllerActions = {
  onSetInput: (v: string) => void;
  onSetAgent: (a: ChatAgent) => void;
  onSend: () => Promise<void>;
  onResetThread: () => void;
};

type ChatControllerRefs = {
  endRef: React.RefObject<HTMLDivElement | null>;
};

export function useChatController({ user }: UseChatControllerArgs) {
  useTitle("Arbiter • Chat");

  const endRef = React.useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const net = useNetworkState();
  const online = Boolean(net.online ?? true);

  const queryThreadId = searchParams.get("thread") || undefined;

  const [input, setInput] = React.useState("");
  const [agent, setAgent] = React.useState<ChatAgent>("Supervisor");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = React.useState<string | undefined>(queryThreadId);
  
  React.useEffect(() => {
    setThreadId(queryThreadId);
    if (!queryThreadId) {
        setMessages([]);
    }
  }, [queryThreadId]);

  const [, loadThread] = useAsyncFn(async (tid: string) => {
    try {
      const msgs = await api.chat.getThreadMessages(tid, user);
      const mapped: ChatMessage[] = msgs.map((m) => ({
        id: String(m.id),
        role: m.role === "system" ? "assistant" : (m.role as "user" | "assistant"),
        content: m.content,
        agent: "System",
      }));
      setMessages(mapped);
    } catch (e) {
      console.error("Failed to load thread", e);
    }
  }, [user]);
  
  React.useEffect(() => {
    if (threadId) {
      loadThread(threadId);
    }
  }, [threadId, loadThread]);

  const scrollToEnd = React.useCallback(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    scrollToEnd();
  }, [messages.length, scrollToEnd]);

  const [{ loading }, send] = useAsyncFn(async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      role: "user",
      content: text,
      agent,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const payload: ChatRequest = {
      message: userMsg.content,
      agent,
      user_id: user.id,
      tenant: user.tenant,
      thread_id: threadId,
    };

    let res: ChatResponse;

    try {
      res = await api.chat.send(payload, user);
    } catch {
      const errMsg: ChatMessage = {
        id: `${Date.now()}-e`,
        role: "assistant",
        content: "Sorry, I encountered an error processing your request.",
        agent: "System",
      };
      setMessages((prev) => [...prev, errMsg]);
      return;
    }

    if (!threadId) {
      setThreadId(res.thread_id);
      router.push(`${pathname}?thread=${res.thread_id}`);
    }

    const botMsg: ChatMessage = {
      id: `${Date.now()}-a`,
      role: "assistant",
      content: res.response,
      agent,
    };

    setMessages((prev) => [...prev, botMsg]);
  }, [agent, input, pathname, router, user.tenant, threadId, user.id]);

  const onSend = React.useCallback(async () => {
    if (!online) return;
    if (loading) return;
    if (!input.trim()) return;
    await send();
    scrollToEnd();
  }, [input, loading, online, scrollToEnd, send]);

  const onResetThread = React.useCallback(() => {
    setMessages([]);
    setThreadId(undefined);
    setInput("");
    router.push(pathname);
  }, [pathname, router]);

  const canSend = online && !loading && input.trim().length > 0;

  const state: ChatControllerState = {
    input,
    agent,
    messages,
    loading,
    threadId,
    online,
    canSend,
  };

  const actions: ChatControllerActions = {
    onSetInput: setInput,
    onSetAgent: setAgent,
    onSend,
    onResetThread,
  };

  const refs: ChatControllerRefs = { endRef };

  return { state, actions, refs };
}
