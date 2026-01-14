"use client";

import { useState, useRef, useEffect } from "react";
import { Shell } from "@/components/layout/shell";
import { api } from "@/lib/api";
import { useUser } from "@/components/providers/user-provider";
import { ChatRequest } from "@/types";
import { cn } from "@/lib/utils";
import { Bot, FileText, Film, Send, User as UserIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: string;
};

const AGENTS = [
  { value: "Supervisor", label: "Supervisor", icon: Bot },
  { value: "Documents", label: "Documents", icon: FileText },
  { value: "Movies", label: "Movies", icon: Film },
];

export default function ChatPage() {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [agent, setAgent] = useState<"Supervisor" | "Documents" | "Movies">("Supervisor");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const payload: ChatRequest = {
        message: userMsg.content,
        agent,
        user_id: user.id,
        tenant: user.tenant,
        thread_id: threadId,
      };

      const res = await api.chat.send(payload);
      
      if (!threadId) {
          setThreadId(res.thread_id);
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.response,
        agent,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request.",
        agent: "System",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold font-display text-gradient">Chat</h2>
            <p className="text-muted-foreground">
                Interact with your specialized AI agents.
            </p>
          </div>
          <div className="w-[200px]">
            <Select value={agent} onValueChange={(v: any) => setAgent(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                {AGENTS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    <div className="flex items-center gap-2">
                      <a.icon className="h-4 w-4" />
                      <span>{a.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border-muted">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground opacity-50">
                            <Bot className="h-16 w-16 mb-4" />
                            <p>Select an agent and start chatting.</p>
                        </div>
                    )}
                    
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full gap-3",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <Avatar className={cn(
                                "h-8 w-8",
                                msg.role === "assistant" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                            )}>
                                {msg.role === "assistant" ? (
                                    <AvatarImage src="/bot-avatar.png" /> // Fallback icon
                                ) : (
                                    <AvatarImage src="/user-avatar.png" />
                                )}
                                <AvatarFallback>
                                    {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className={cn(
                                "flex flex-col max-w-[80%]",
                                msg.role === "user" ? "items-end" : "items-start"
                            )}>
                                <div className={cn(
                                    "px-4 py-2 rounded-2xl text-sm shadow-sm",
                                    msg.role === "user" 
                                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                                        : "bg-muted text-foreground rounded-tl-none"
                                )}>
                                    {msg.content}
                                </div>
                                {msg.role === "assistant" && (
                                    <span className="text-[10px] text-muted-foreground mt-1 ml-1 flex items-center gap-1">
                                        {msg.agent === "Movies" && <Film className="h-3 w-3" />}
                                        {msg.agent === "Documents" && <FileText className="h-3 w-3" />}
                                        {msg.agent === "Supervisor" && <Bot className="h-3 w-3" />}
                                        {msg.agent}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="flex w-full gap-3">
                             <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                                <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-none flex items-center gap-1">
                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            
            <div className="p-4 bg-background border-t">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <Input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message ${agent}...`}
                        disabled={loading}
                        className="flex-1"
                        autoFocus
                    />
                    <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </Card>
      </div>
    </Shell>
  );
}
