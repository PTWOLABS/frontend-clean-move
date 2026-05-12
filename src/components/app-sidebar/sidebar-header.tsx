import Image from "next/image";

import logoIcon from "@/assets/logo-icon.svg";
import { SidebarHeader as SidebarPrimitiveHeader } from "@/components/ui/sidebar";
import { AppSidebarTrigger } from "./app-sidebar-trigger";

export function AppSidebarHeader() {
  return (
    <SidebarPrimitiveHeader className="border-b border-sidebar-border px-3 py-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
      <div className="flex min-w-0 items-center justify-between gap-3 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <div className="flex min-w-0 items-center gap-3 group-data-[collapsible=icon]:hidden">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary p-1.5 text-sidebar-primary-foreground">
            <Image src={logoIcon} alt="" aria-hidden width={28} height={28} className="size-7" />
          </span>
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold leading-none text-sidebar-foreground">
              Clean<span className="text-primary">Move</span>
            </div>

            <p className="mt-1 truncate text-xs text-sidebar-foreground/60">Gestão operacional</p>
          </div>
        </div>

        <AppSidebarTrigger />
      </div>
    </SidebarPrimitiveHeader>
  );
}
