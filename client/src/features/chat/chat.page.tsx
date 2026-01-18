"use client";

import * as React from "react";
import { Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/components/providers/user-provider";
import {
  useTitle
} from "react-use";
import { AgentSelect } from "./components/agent-select";
import { MessageList } from "./components/message-list";
import { Composer } from "./components/composer";
import { useChatController } from "./chat.controller";

export default function ChatPage() {
  useTitle("Arbiter • Chat");
  const { user } = useUser();
  const ctrl = useChatController({ user });

  return (
    <>
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-start md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h2 className="text-4xl font-bold font-display text-gradient">
              Chat
            </h2>
            <p className="font-sans">
              Interact with specialized agents with thread persistence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AgentSelect
              value={ctrl.state.agent}
              onChange={ctrl.actions.onSetAgent}
            />
          </div>
        </div>

        <Card className="surface flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            {ctrl.state.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[420px] text-muted-foreground opacity-90">
                <div className="surface-hero w-full max-w-lg p-8 flex flex-col items-center text-center">
                  <Bot
                    className="h-14 w-14 mb-4 text-primary"
                    aria-hidden="true"
                  />
                  <p className="font-medium text-foreground">
                    Select an agent and start chatting.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Threads persist automatically. Keep it practical and fast.
                  </p>
                </div>
              </div>
            ) : (
              <MessageList
                messages={ctrl.state.messages}
                loading={ctrl.state.loading}
                endRef={ctrl.refs.endRef}
              />
            )}
          </ScrollArea>

          <Composer
            value={ctrl.state.input}
            onChange={ctrl.actions.onSetInput}
            onSend={ctrl.actions.onSend}
            disabled={!ctrl.state.canSend}
            online={ctrl.state.online}
            loading={ctrl.state.loading}
            onResetThread={ctrl.actions.onResetThread}
          />
        </Card>
      </div>
    </>
  );
}
