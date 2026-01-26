"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/user-provider";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UserCreate } from "@/types";

export function UserSelector() {
  const { user, setUser, availableUsers, refetchUsers } = useUser();
  const [open, setOpen] = React.useState(false);
  const [showNewUserDialog, setShowNewUserDialog] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  
  // Form State
  const [username, setUsername] = React.useState("");
  const [role, setRole] = React.useState<"user" | "admin">("user");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    
    setLoading(true);
    try {
      const newUser = await api.users.create({
        username,
        password: "password", // Default password for simplicity as per requirement context (local dev/demo)
        role
      }, user); // Use current user context for the request headers
      
      await refetchUsers();
      setUser(newUser);
      setShowNewUserDialog(false);
      setUsername("");
      setRole("user");
      toast.success("User created and switched successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <UserIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">{user.username}</span>
              <span className="truncate text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-56 rounded-lg p-0" align="start" side="bottom" sideOffset={4}>
          <Command>
            <CommandInput placeholder="Switch user..." />
            <CommandList>
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup heading="Available Users">
                {availableUsers.map((u) => (
                  <CommandItem
                    key={u.id}
                    value={u.username}
                    onSelect={() => {
                      setUser(u);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        user.id === u.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{u.username}</span>
                      <span className="text-xs text-muted-foreground">ID: {u.id} • {u.role}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowNewUserDialog(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create new user
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. Password will be defaulted to "password".
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="jdoe"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(val: "user" | "admin") => setRole(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewUserDialog(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
