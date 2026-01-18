"use client";

import * as React from "react";
import { useAsync, useNetworkState, useWindowSize } from "react-use";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Film, Loader2, WifiOff } from "lucide-react";
import { api } from "@/lib/api";
import { useUser } from "@/components/providers/user-provider";
import type { Document } from "@/types";
import { cn } from "@/lib/utils";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  subtle = false,
}: {
  readonly title: string;
  readonly value: string | number;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly description: string;
  readonly subtle?: boolean;
}) {
  return (
    <Card
      className={cn(
        "surface transition-all duration-300",
        !subtle && "hover:shadow-lg hover:-translate-y-0.5",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const net = useNetworkState();
  const { width } = useWindowSize();
  const documentsState = useAsync(() => api.documents.list(user), [ user ]);
  const recentDocs = React.useMemo(
    () => (documentsState.value || []).slice(0, 6),
    [ documentsState.value ]
  );

  const online = Boolean(net.online ?? true);
  const cols = React.useMemo(
    () => (width && width >= 1280) ? 4 : (width && width >= 1024) ? 3 : 1,
    [ width ]
  );

  return (
    <>
      <div className="flex flex-col space-y-2">
        <h2 className="text-4xl font-bold font-display text-gradient">
          Dashboard
        </h2>
        <p className="font-sans">
          Welcome back,{" "}
          <span className="font-semibold text-foreground">{user.username}</span>
          . Here&apos;s what&apos;s happening.
        </p>

        {!online && (
          <div className="surface-hero px-4 py-3 inline-flex items-center gap-2 text-sm text-muted-foreground w-fit">
            <WifiOff className="h-4 w-4" aria-hidden="true" />
            Offline mode: data may be stale.
          </div>
        )}
      </div>

      <div
        className={cn(
          "grid gap-4",
          cols === 1
            ? "grid-cols-1"
            : cols === 3
              ? "md:grid-cols-3"
              : "md:grid-cols-3 lg:grid-cols-4",
        )}
      >
        <StatCard
          title="Total Documents"
          value={documentsState.loading ? "…" : recentDocs.length}
          icon={FileText}
          description="Stored in your secure vault"
        />
        <StatCard
          title="Movie Agent"
          value="Active"
          icon={Film}
          description="Ready to discover"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="surface col-span-4 overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {documentsState.loading ? (
              <div className="flex h-55 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentDocs.length === 0 ? (
              <div className="flex h-55 items-center justify-center text-muted-foreground text-sm">
                No documents found. Start by creating one.
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocs.map((doc: Document) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-card/60 backdrop-blur supports-backdrop-filter:bg-card/40 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-none truncate">
                          {doc.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-105">
                          {doc.content
                            ? `${doc.content.substring(0, 80)}…`
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono shrink-0">
                      {doc.id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="surface col-span-4 md:col-span-3 overflow-hidden">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="p-4 rounded-2xl border border-dashed border-muted-foreground/25 flex items-center justify-center text-sm text-muted-foreground hover:bg-muted/20 cursor-pointer transition-all">
              Start a New Chat
            </div>
            <div className="p-4 rounded-2xl border border-dashed border-muted-foreground/25 flex items-center justify-center text-sm text-muted-foreground hover:bg-muted/20 cursor-pointer transition-all">
              Upload Document
            </div>
            <div className="p-4 rounded-2xl border border-dashed border-muted-foreground/25 flex items-center justify-center text-sm text-muted-foreground hover:bg-muted/20 cursor-pointer transition-all">
              Find a Movie
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}