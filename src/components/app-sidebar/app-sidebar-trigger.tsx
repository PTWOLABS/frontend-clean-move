"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function AppSidebarTrigger() {
  return (
    <SidebarTrigger
      aria-label="Alternar menu lateral"
      className="
        size-8 shrink-0 rounded-lg
        text-sidebar-foreground/70 transition-colors duration-200 ease-clean hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
        group-data-[collapsible=icon]:size-9
      "
    />
  );
}

export function AppSidebarMobileTrigger() {
  const { setOpenMobile } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Abrir menu lateral"
      onClick={() => setOpenMobile(true)}
      className={`
        size-9 rounded-lg border border-border bg-background
        text-muted-foreground transition-colors duration-200 ease-clean
        hover:bg-accent hover:text-accent-foreground
      `}
    >
      <Menu aria-hidden className="size-4" />
    </Button>
  );
}
