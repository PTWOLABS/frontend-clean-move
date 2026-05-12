import { SidebarContent as SidebarPrimitiveContent } from "@/components/ui/sidebar";

import { AppSidebarNavItems } from "./nav-items";

export function AppSidebarContent({ pathname }: { pathname: string }) {
  return (
    <SidebarPrimitiveContent className="gap-1 px-1 py-3">
      <AppSidebarNavItems pathname={pathname} />
    </SidebarPrimitiveContent>
  );
}
