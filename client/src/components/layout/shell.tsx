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

import { Suspense } from "react";

export function Shell({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <Suspense fallback={<div className="w-[250px] bg-sidebar" />}>
        <AppSidebar />
      </Suspense>
      <SidebarInset>
        <Header/>
        <div
          id="main"
          className={cn(
            "flex-1 overflow-x-hidden",
            pathname?.startsWith("/chat")
              ? "flex flex-col min-h-0 p-3 md:p-6 overflow-hidden"
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
