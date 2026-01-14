"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, FileText, Film, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserSelector } from "@/components/user-selector";
import { Separator } from "@/components/ui/separator";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Chat",
    icon: MessageSquare,
    href: "/chat",
    color: "text-violet-500",
  },
  {
    label: "Documents",
    icon: FileText,
    href: "/documents",
    color: "text-pink-700",
  },
  {
    label: "Movies",
    icon: Film,
    href: "/movies",
    color: "text-orange-700",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground w-64">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-10 group">
            <div className="relative w-8 h-8 mr-3 bg-linear-to-tr from-primary to-secondary rounded-lg flex items-center justify-center">
                 <span className="font-bold text-white text-lg">A</span>
            </div>
          <h1 className="text-2xl font-bold font-display text-gradient">
            Arbiter
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
            >
                <Button 
                    variant={pathname === route.href ? "secondary" : "ghost"} 
                    className={cn(
                        "w-full justify-start transition-all hover:scale-[1.02] active:scale-[0.98]", 
                        pathname === route.href && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    )}
                >
                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                    {route.label}
                </Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
         <Separator className="mb-4" />
         <UserSelector />
      </div>
    </div>
  );
}
