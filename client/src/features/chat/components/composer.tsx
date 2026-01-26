"use client";

import * as React from "react";
import { Loader2, Send, WifiOff, RotateCcw, Sparkles } from "lucide-react";
import { useStartTyping } from "react-use";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Composer({
  value,
  onChange,
  onSend,
  disabled,
  online,
  loading,
  onResetThread,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
  online: boolean;
  loading: boolean;
  onResetThread: () => void;
}) {
  const [isTyping, setIsTyping] = React.useState(false);

  useStartTyping(() => {
    setIsTyping(true);
    window.setTimeout(() => setIsTyping(false), 900);
  });

  return (
    <div className="sticky bottom-0 z-10 border-t bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/50 py-0">
      <div className="p-4 space-y-3 ">
        {!online && (
          <div className="surface-hero px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <WifiOff className="h-4 w-4" aria-hidden="true" />
              <span>Offline. Reconnect to send messages.</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetThread}
              className="focus-ring rounded-xl"
            >
              <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
              Reset
            </Button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
          className="flex items-center gap-2 "
        >
          <div className="relative flex-1">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Message…"
              disabled={loading}
              className={cn(
                "h-12 rounded-2xl pr-10 focus-ring surface",
                "placeholder:text-muted-foreground/80",
              )}
              aria-label="Message input"
            />
            <div
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 transition-opacity",
                isTyping ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            >
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={disabled}
            className="h-12 w-12 rounded-2xl focus-ring shadow-lg shadow-primary/20"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
