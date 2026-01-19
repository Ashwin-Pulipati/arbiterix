import {
  FileText,
  Film,
  History,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Trash2,
  Loader2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useAsyncFn, useMedia } from "react-use";

import { useUser } from "@/components/providers/user-provider";
import ThemeToggle from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { UserSelector } from "./user-selector";

const baseRoutes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Chat", icon: MessageSquare, href: "/chat" },
  { label: "Documents", icon: FileText, href: "/documents" },
  { label: "Movies", icon: Film, href: "/movies" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useUser();
  const isMdUp = useMedia("(min-width: 768px)", false);

  const routes = React.useMemo(() => {
    const allRoutes = [...baseRoutes];
    if (user && user.role === 'admin') {
      allRoutes.push({ label: "Users", icon: Users, href: "/users" });
    }
    return allRoutes;
  }, [user]);
  
  const [historyState, fetchHistory] = useAsyncFn(async () => {
    if (!user) return [];
    return api.chat.listThreads(user);
  }, [user]);

  const [deleteState, deleteThread] = useAsyncFn(
    async (id: number) => {
      await api.chat.deleteThread(id, user);
      await fetchHistory();
    },
    [user, fetchHistory],
  );

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const history = historyState.value || [];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {isMdUp ? <SidebarTrigger className="ml-auto" /> : <UserSelector />}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu className="px-2">
            {routes.map((route) => {
              const active = pathname === route.href;
              const Icon = route.icon;
              return (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={route.label}
                    className="rounded-2xl px-3"
                  >
                    <Link href={route.href}>
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          active ? "" : ""
                        )}
                      />
                      <span>{route.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="flex items-center gap-2">
            <History className="h-3.5 w-3.5" aria-hidden="true" />
            Recents
          </SidebarGroupLabel>

          <SidebarGroupAction title="New Chat" asChild className="hover:bg-accent">
            <Link
              href="/chat"
              className="focus-ring rounded-full"
            >
              <Plus />
              <span className="sr-only">New Chat</span>
            </Link>
          </SidebarGroupAction>

          <SidebarMenu className="px-2">
            {historyState.loading ? (
              <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Chats...
              </div>
            ) : (
              history.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="rounded-2xl px-3 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Link href={`/chat?thread=${item.uuid}`}>
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction
                        showOnHover
                        className="focus-ring rounded-md"
                      >
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      className="w-52 rounded-xl"
                      side="bottom"
                      align="end"
                    >
                      <DropdownMenuItem
                        onClick={() => deleteThread(item.id)}
                        disabled={deleteState.loading}
                        className="gap-2"
                      >
                        <Trash2 className="text-muted-foreground" />
                        <span>Delete Thread</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))
            )}
            {!historyState.loading && history.length === 0 && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No recent chats.
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="hidden group-data-[collapsible=icon]:block">
          <SidebarMenu className="px-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Recents"
                className={cn("rounded-2xl px-3")}
              >
                <History className="h-4 w-4" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>Theme</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <ThemeToggle />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}