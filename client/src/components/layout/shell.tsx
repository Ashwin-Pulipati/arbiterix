"use client";

import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import * as React from "react";
import Footer from "../footer";
import { AppSidebar } from "../app-sidebar";
import Header from "../header";

export function Shell({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header/>
        <div
          id="main"
          className={cn(
            "flex-1",
            pathname?.startsWith("/chat")
              ? "flex flex-col h-[calc(100svh-3.5rem)] p-3 md:p-6 overflow-hidden"
              : "space-y-6 p-4 pt-6 md:p-8 overflow-y-auto",
          )}
        >
          {children}
        </div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
