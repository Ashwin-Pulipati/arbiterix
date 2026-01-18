"use client";

import * as React from "react";
import { Bot, FileText, Film, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatMessage } from "../chat.controller";

export type MessageListProps = {
  messages: ChatMessage[];
  loading: boolean;
  endRef: React.RefObject<HTMLDivElement | null>;
};

function AgentIcon({ agent }: { readonly agent: ChatMessage["agent"] }) {
  if (agent === "Movies")
    return <Film className="h-3 w-3" aria-hidden="true" />;
  if (agent === "Documents")
    return <FileText className="h-3 w-3" aria-hidden="true" />;
  return <Bot className="h-3 w-3" aria-hidden="true" />;
}

export function MessageList({ messages, loading, endRef }: MessageListProps) {
  return (
    <div
      className="space-y-5"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={cn(
              "flex w-full gap-3",
              isUser ? "flex-row-reverse" : "flex-row",
            )}
          >
            <Avatar
              className={cn(
                "h-8 w-8 ring-1 ring-border/60",
                isUser
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary/10 text-primary",
              )}
            >
              {isUser ? (
                <AvatarImage src="/user-avatar.png" alt="" />
              ) : (
                <AvatarImage src="/bot-avatar.png" alt="" />
              )}
              <AvatarFallback>
                {isUser ? (
                  <UserIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                ) : (
                  <Bot className="h-4 w-4" aria-hidden="true" />
                )}
              </AvatarFallback>
            </Avatar>

            <div
              className={cn(
                "flex flex-col max-w-[86%] md:max-w-[78%]",
                isUser ? "items-end" : "items-start",
              )}
            >
              <div
                className={cn(
                  "px-4 py-2.5 rounded-3xl text-sm shadow-sm whitespace-pre-wrap wrap-break-word",
                  "ring-1 ring-border/50",
                  isUser
                    ? "bg-linear-to-br from-primary/20 via-secondary/20 to-accent/20 text-foreground rounded-tr-none"
                    : "bg-card/70 backdrop-blur supports-backdrop-filter:bg-card/50 text-foreground rounded-tl-none",
                )}
              >
                {msg.content}
              </div>

              <div
                className={cn(
                  "mt-1 inline-flex items-center gap-2 text-[10px]",
                  isUser ? "text-muted-foreground/80" : "text-muted-foreground",
                )}
              >
                {!isUser && (
                  <span className="inline-flex items-center gap-1">
                    <AgentIcon agent={msg.agent} />
                    <span className="font-medium">{msg.agent}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {loading && (
        <div className="flex w-full gap-3">
          <Avatar className="h-8 w-8 bg-primary/10 text-primary ring-1 ring-border/60">
            <AvatarFallback>
              <Bot className="h-4 w-4" aria-hidden="true" />
            </AvatarFallback>
          </Avatar>

          <div
            className="surface px-4 py-2.5 rounded-3xl rounded-tl-none flex items-center gap-1"
            aria-label="Assistant is typing"
          >
            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
            <span className="sr-only">Assistant is typing</span>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
