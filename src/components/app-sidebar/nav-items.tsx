"use client";

import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  Car,
  ChevronDown,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/shared/utils/cn";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type PosNavigationItem = {
  label: string;
  href: string;
};

const operationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agenda", href: "/agenda", icon: CalendarDays },
  { label: "Agendamentos", href: "/appointments", icon: ClipboardList },
];

const registerItems: NavigationItem[] = [
  { label: "Clientes", href: "/customers", icon: Users },
  { label: "Veículos", href: "/vehicles", icon: Car },
  { label: "Serviços", href: "/services", icon: Wrench },
];

const managementItems: NavigationItem[] = [
  { label: "Orçamentos", href: "/budgets", icon: FileText },
  { label: "Relatórios", href: "/reports", icon: BarChart3 },
  { label: "Configurações", href: "/settings", icon: Settings },
];

const posItems: PosNavigationItem[] = [
  { label: "Venda / caixa", href: "/pos" },
  { label: "Movimentações", href: "/pos/movements" },
  { label: "Fechamento", href: "/pos/closing" },
];

const menuButtonClassName =
  "group/nav-button h-10 rounded-sidebar-item px-2.5 text-[13px] font-medium text-sidebar-foreground/90 transition-colors duration-200 ease-clean hover:bg-sidebar-accent hover:text-sidebar-foreground/90 dark:hover:text-sidebar-accent-foreground data-[active=true]:bg-accent/10 data-[active=true]:text-accent data-[active=true]:hover:bg-accent/15 data-[active=true]:hover:text-accent group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!p-0";

const menuLabelClassName = "group-data-[collapsible=icon]:hidden";

const groupLabelClassName =
  "h-7 px-2 text-[11px] font-semibold uppercase text-accent group-data-[collapsible=icon]:hidden";

function isRouteActive(pathname: string, href: string, exact = false) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      aria-hidden
      className="flex size-5 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors group-data-[active=true]/nav-button:text-accent group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:bg-transparent"
    >
      <Icon className="size-4.5 group-data-[collapsible=icon]:size-5" />
    </span>
  );
}

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavigationItem[];
  pathname: string;
}) {
  return (
    <SidebarGroup className="px-2 py-1.5 group-data-[collapsible=icon]:px-0">
      <SidebarGroupLabel className={groupLabelClassName}>{label}</SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:items-center">
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isRouteActive(pathname, item.href)}
                tooltip={item.label}
                className={menuButtonClassName}
              >
                <Link href={item.href}>
                  <NavIcon icon={item.icon} />
                  <span className={menuLabelClassName}>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function PosNavigationItem({ pathname }: { pathname: string }) {
  const isPosActive = isRouteActive(pathname, "/pos");
  const [isOpen, setIsOpen] = useState(false);
  const isExpanded = isOpen || isPosActive;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        isActive={isPosActive}
        tooltip="PDV"
        className={menuButtonClassName}
        onClick={() => setIsOpen((current) => !current)}
        aria-controls="sidebar-pdv-submenu"
        aria-expanded={isExpanded}
        data-state={isExpanded ? "open" : "closed"}
      >
        <NavIcon icon={ShoppingCart} />

        <span className={menuLabelClassName}>PDV</span>

        <ChevronDown
          aria-hidden
          className={cn(
            "ml-auto size-4 text-sidebar-foreground/60 transition-transform duration-200 ease-clean group-data-[collapsible=icon]:hidden",
            isExpanded && "rotate-180",
          )}
        />
      </SidebarMenuButton>

      {isExpanded ? (
        <SidebarMenuSub
          id="sidebar-pdv-submenu"
          className="mx-5 my-1 gap-1 border-sidebar-border px-3 py-1 group-data-[collapsible=icon]:hidden"
        >
          {posItems.map((item) => (
            <SidebarMenuSubItem key={item.href}>
              <SidebarMenuSubButton
                asChild
                isActive={isRouteActive(pathname, item.href, item.href === "/pos")}
                className="h-8 rounded-lg px-2.5 text-[13px] text-sidebar-foreground/85 hover:text-sidebar-foreground/85 dark:hover:text-sidebar-accent-foreground data-[active=true]:bg-accent/10 data-[active=true]:text-accent"
              >
                <Link href={item.href}>
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
}

function OperationSection({ pathname }: { pathname: string }) {
  return (
    <SidebarGroup className="px-2 py-1.5 group-data-[collapsible=icon]:px-0">
      <SidebarGroupLabel className={groupLabelClassName}>Operação</SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:items-center">
          {operationItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isRouteActive(pathname, item.href)}
                tooltip={item.label}
                className={menuButtonClassName}
              >
                <Link href={item.href}>
                  <NavIcon icon={item.icon} />
                  <span className={menuLabelClassName}>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <PosNavigationItem pathname={pathname} />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebarNavItems({ pathname }: { pathname: string }) {
  return (
    <>
      <OperationSection pathname={pathname} />
      <NavSection label="Cadastros" items={registerItems} pathname={pathname} />
      <NavSection label="Gestão" items={managementItems} pathname={pathname} />
    </>
  );
}
