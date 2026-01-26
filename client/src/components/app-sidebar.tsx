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
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import * as React from "react";
import { useMedia } from "react-use";

import { useUser } from "@/components/providers/user-provider";
import { useChatHistory } from "@/components/providers/chat-provider";
import ThemeToggle from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { threads: history, loading: historyLoading, deleteThread, updateThread } = useChatHistory();
  const isMdUp = useMedia("(min-width: 768px)", false);

  const [renameId, setRenameId] = React.useState<number | null>(null);
  const [newName, setNewName] = React.useState("");
  const [renaming, setRenaming] = React.useState(false);

    const isNewChat = pathname === "/chat" && searchParams.get("new") === "true";

  

    const routes = React.useMemo(() => {

      return [...baseRoutes];

    }, []);

  

    const handleDelete = async (id: number, uuid: string) => {

      await deleteThread(id);

      if (searchParams.get("thread") === uuid) {

        router.push("/chat");

      }

    };

  

    const handleRename = async (e: React.FormEvent) => {

      e.preventDefault();

      if (!renameId || !newName.trim()) return;

      setRenaming(true);

      try {

        await updateThread(renameId, newName);

        setRenameId(null);

        setNewName("");

      } finally {

        setRenaming(false);

      }

    };

  

    return (

      <>

        <Sidebar collapsible="icon" {...props}>

          <SidebarHeader>

            {isMdUp ? <SidebarTrigger className="ml-auto" /> : <UserSelector />}

          </SidebarHeader>

  

          <SidebarContent>

            {/* ... existing platform group ... */}

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

                  href="/chat?new=true"

                  className="focus-ring rounded-full"

                >

                  <Plus />

                  <span className="sr-only">New Chat</span>

                </Link>

              </SidebarGroupAction>

  

                                      <SidebarMenu className="px-2">

  

                                        {isNewChat && (

  

                                          <SidebarMenuItem>

  

                                            <SidebarMenuButton

  

                                              isActive

  

                                              className="rounded-2xl px-3"

  

                                            >

  

                                              <MessageSquare className="h-4 w-4" />

  

                                              <span>New Chat</span>

  

                                            </SidebarMenuButton>

  

                                          </SidebarMenuItem>

  

                                        )}

  

                                        {historyLoading ? (

  

                                          <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">

  

                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />

  

                                            Loading Chats...

  

                                          </div>

  

                                        ) : (

  

                                          history.map((item) => {

  

                                            const isActive = searchParams.get("thread") === item.uuid;

  

                                            return (

  

                                              <SidebarMenuItem key={item.id}>

  

                                                <SidebarMenuButton

  

                                                  asChild

  

                                                  isActive={isActive}

  

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

  

                                                      onClick={() => {

  

                                                        setRenameId(item.id);

  

                                                        setNewName(item.title);

  

                                                      }}

  

                                                      className="gap-2"

  

                                                    >

  

                                                      <Pencil className="text-muted-foreground" />

  

                                                      <span>Rename</span>

  

                                                    </DropdownMenuItem>

  

                                                    <DropdownMenuItem

  

                                                      onClick={() => handleDelete(item.id, item.uuid)}

  

                                                      className="gap-2"

  

                                                    >

  

                                                      <Trash2 className="text-muted-foreground" />

  

                                                      <span>Delete Thread</span>

  

                                                    </DropdownMenuItem>

  

                                                  </DropdownMenuContent>

  

                                                </DropdownMenu>

  

                                              </SidebarMenuItem>

  

                                            );

  

                                          })

  

                                        )}

  

                                        {!historyLoading && history.length === 0 && !isNewChat && (

  

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

      <Dialog open={!!renameId} onOpenChange={(open) => !open && setRenameId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat thread.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRename}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Chat name"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenameId(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={renaming}>
                {renaming ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}