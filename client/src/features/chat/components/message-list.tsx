"use client";

import * as React from "react";
import { Bot, FileText, Film, User as UserIcon, Copy, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { ChatMessage } from "../chat.controller";
import type { User } from "@/types";

export type MessageListProps = {
  readonly messages: ChatMessage[];
  readonly loading: boolean;
  readonly endRef: React.RefObject<HTMLDivElement | null>;
  readonly user: User;
  readonly onUpdateMessage: (id: string, content: string) => Promise<void>;
};

function AgentIcon({ agent }: { readonly agent: ChatMessage["agent"] }) {
  if (agent === "Movies")
    return <Film className="h-3 w-3" aria-hidden="true" />;
  if (agent === "Documents")
    return <FileText className="h-3 w-3" aria-hidden="true" />;
  return <Bot className="h-3 w-3" aria-hidden="true" />;
}

const MessageItem = React.memo(function MessageItem({ 
  msg, 
  user, 
  onUpdate 
}: { 
  readonly msg: ChatMessage; 
  readonly user: User;
  readonly onUpdate: (id: string, content: string) => Promise<void>;
}) {
  const isUser = msg.role === "user";
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(msg.content);
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.content);
    setIsCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = async () => {
    if (editContent.trim() !== msg.content) {
      await onUpdate(msg.id, editContent);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 group",
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
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full min-w-[200px]">
            <Textarea 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)}
              className="bg-background/80"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "px-4 py-2.5 rounded-3xl text-sm shadow-sm whitespace-pre-wrap wrap-break-word relative group/bubble",
              "ring-1 ring-border/50",
              isUser
                ? "bg-linear-to-br from-primary/20 via-secondary/20 to-accent/20 text-foreground rounded-tr-none"
                : "bg-card/70 backdrop-blur supports-backdrop-filter:bg-card/50 text-foreground rounded-tl-none",
            )}
          >
            {msg.content}
            <div className={cn(
              "absolute -bottom-10 flex items-center gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity",
              isUser ? "right-0" : "left-0"
            )}>
              <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleCopy} title="Copy">
                {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
              {isUser && (
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setIsEditing(true)} title="Edit">
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export const MessageList = React.memo(function MessageList({ messages, loading, endRef, user, onUpdateMessage }: MessageListProps) {
  return (
    <div
      className="space-y-6 pb-4"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {messages.map((msg) => (
        <MessageItem key={msg.id} msg={msg} user={user} onUpdate={onUpdateMessage} />
      ))}

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
});