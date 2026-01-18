"use client";

import * as React from "react";
import { Check, ChevronsUpDown, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/components/providers/user-provider";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function UserSelector() {
  const { user, setUser, availableUsers } = useUser();
  const [open, setOpen] = React.useState(false);

  return (
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
            <CommandGroup>
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}