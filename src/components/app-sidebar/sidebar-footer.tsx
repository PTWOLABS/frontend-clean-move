"use client";

import {
  SidebarFooter as SidebarPrimitiveFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { useLogout } from "@/features/auth/hooks/use-logout";

export function AppSidebarFooter() {
  const { mutate: logout, isPending } = useLogout();

  return (
    <SidebarPrimitiveFooter className="mt-auto border-t border-sidebar-border p-2 overflow-x-hidden">
      <SidebarMenu className="group-data-[collapsible=icon]:items-center">
        <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
          <SidebarMenuButton
            className="w-full overflow-hidden text-destructive/90 hover:bg-destructive/10 hover:text-destructive focus:text-destructive hover:cursor-pointer group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!p-0 justify-center"
            disabled={isPending}
            onClick={() => {
              logout();
            }}
          >
            <LogOut aria-hidden />
            <span className="min-w-0 truncate whitespace-nowrap group-data-[collapsible=icon]:sr-only">
              Sair
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarPrimitiveFooter>
  );
}
