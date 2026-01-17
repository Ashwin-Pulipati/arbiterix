"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, FileText, Film, MoreHorizontal, Trash2, Plus } from "lucide-react"
import { useAsyncFn } from "react-use"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserSelector } from "@/components/user-selector"
import { useUser } from "@/components/providers/user-provider"
import { api } from "@/lib/api"

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
  { label: "Movies", icon: Film, href: "/movies", color: "text-orange-700" },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useUser()

  const [historyState, fetchHistory] = useAsyncFn(async () => {
    if (!user) return []
    return api.chat.listThreads(user)
  }, [user])

  const [, deleteThread] = useAsyncFn(async (id: number) => {
    await api.chat.deleteThread(id, user)
    fetchHistory()
  }, [user, fetchHistory])

  React.useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Poll for updates (simple way to keep history fresh when chatting)
  React.useEffect(() => {
    const interval = setInterval(fetchHistory, 5000)
    return () => clearInterval(interval)
  }, [fetchHistory])

  const history = historyState.value || []

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center"
        >
          <div className="relative flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-tr from-primary to-secondary text-sidebar-primary-foreground shadow-sm">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-bold font-display text-gradient">Arbiter</span>
            <span className="truncate text-xs text-muted-foreground">Agentic Workspace</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu className="px-2">
            {routes.map((route) => {
              const active = pathname === route.href
              return (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={route.label}
                    className="rounded-xl px-3"
                  >
                    <Link href={route.href}>
                      <route.icon className={route.color} />
                      <span>{route.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

                {history.length > 0 && (
                  <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                    <SidebarGroupLabel>Recents</SidebarGroupLabel>
                    <SidebarGroupAction title="New Chat" asChild>
                      <Link href="/chat">
                        <Plus /> <span className="sr-only">New Chat</span>
                      </Link>
                    </SidebarGroupAction>
                    <SidebarMenu className="px-2">
              {history.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild tooltip={item.title} className="rounded-xl px-3">
                    <Link href={`/chat?thread=${item.uuid}`}>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 rounded-lg" side="bottom" align="end">
                      <DropdownMenuItem onClick={() => deleteThread(item.id)}>
                        <Trash2 className="text-muted-foreground" />
                        <span>Delete Thread</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserSelector />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
