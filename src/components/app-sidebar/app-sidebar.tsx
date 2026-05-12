"use client";

import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/ui/sidebar";

import { AppSidebarContent } from "./sidebar-content";
import { AppSidebarFooter } from "./sidebar-footer";
import { AppSidebarHeader } from "./sidebar-header";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <AppSidebarHeader />
      <AppSidebarContent pathname={pathname} />
      <AppSidebarFooter />
    </Sidebar>
  );
}
