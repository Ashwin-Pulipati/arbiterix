"use client";

import { useAsync } from "react-use";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Film, Activity, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useUser } from "@/components/providers/user-provider";
import { Document } from "@/types";

function StatCard({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: any, description: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  
  const documentsState = useAsync(async () => {
    return api.documents.list(user);
  }, [user]);

  const recentDocs = documentsState.value || [];

  return (
    <Shell>
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-display text-gradient">Dashboard</h2>
        <p className="text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user.username}</span>. Here's what's happening.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard 
            title="Total Documents" 
            value={documentsState.loading ? "..." : recentDocs.length} 
            icon={FileText} 
            description="Stored in your secure vault" 
        />
        <StatCard 
            title="Movie Agent" 
            value="Active" 
            icon={Film} 
            description="Ready to discover" 
        />
        <StatCard 
            title="System Status" 
            value="Online" 
            icon={Activity} 
            description="All systems operational" 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {documentsState.loading ? (
                <div className="flex h-[200px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : recentDocs.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
                    No documents found. Start by creating one.
                </div>
            ) : (
                <div className="space-y-4">
                    {recentDocs.slice(0, 5).map((doc: Document) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/80 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">{doc.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{doc.content.substring(0, 30)}...</p>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {doc.id}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
               {/* Placeholders for quick actions */}
               <div className="p-4 rounded-lg border border-dashed border-muted-foreground/25 flex items-center justify-center text-sm text-muted-foreground hover:bg-muted/20 cursor-pointer transition-all">
                    Start a New Chat
               </div>
               <div className="p-4 rounded-lg border border-dashed border-muted-foreground/25 flex items-center justify-center text-sm text-muted-foreground hover:bg-muted/20 cursor-pointer transition-all">
                    Upload Document
               </div>
               <div className="p-4 rounded-lg border border-dashed border-muted-foreground/25 flex items-center justify-center text-sm text-muted-foreground hover:bg-muted/20 cursor-pointer transition-all">
                    Find a Movie
               </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}