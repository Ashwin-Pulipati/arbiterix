"use client";

import * as React from "react";
import { KeyboardEvent, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarMenuButton } from "./ui/sidebar";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
] as const;

type ThemeId = (typeof THEME_OPTIONS)[number]["id"];

type ThemeToggleButtonProps = {
  id: ThemeId;
  label: string;
  Icon: React.ElementType;
  isActive: boolean;
  onSelect: (id: ThemeId) => void;
};

const ThemeToggleButton = ({
  id,
  label,
  Icon,
  isActive,
  onSelect,
}: ThemeToggleButtonProps) => {
  const commonProps = {
    type: "button" as const,
    size: "icon" as const,
    onClick: () => onSelect(id),
    "aria-label": `Switch to ${label} theme`,
    role: "radio" as const,
    "aria-checked": isActive,
    className: "rounded-full",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          {...commonProps}
          variant={isActive ? "default" : "ghost"}
          className={cn(commonProps.className)}
        >
          <Icon size={16} aria-hidden />
        </Button>
      </TooltipTrigger>

      <TooltipContent
        side="bottom"
        className="rounded-full text-xs font-medium"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-3" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-7 w-7 rounded-full bg-muted-foreground/15 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const currentTheme: ThemeId =
    (theme as ThemeId) || (systemTheme as ThemeId) || "system";

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();

    const index = THEME_OPTIONS.findIndex((opt) => opt.id === currentTheme);
    const delta = e.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (index + delta + THEME_OPTIONS.length) % THEME_OPTIONS.length;

    setTheme(THEME_OPTIONS[nextIndex].id);
  };

  if (isCollapsed && !isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip="Change Theme"
            className="rounded-2xl px-3 hover:bg-accent"
          >
            <Palette className="h-4 w-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
            <DropdownMenuItem
              key={id}
              onClick={() => setTheme(id)}
              className="group"
            >
              <Icon className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground group-focus:text-background" />
              <span>{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <TooltipProvider delayDuration={120}>
      <div
        className="inline-flex items-center gap-3"
        role="radiogroup"
        aria-label="Theme selection"
        onKeyDown={handleKeyDown}
      >
        {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
          <ThemeToggleButton
            key={id}
            id={id}
            label={label}
            Icon={Icon}
            isActive={currentTheme === id}
            onSelect={(value) => setTheme(value)}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}