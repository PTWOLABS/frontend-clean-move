"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  WalletCards,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import logoIcon from "@/assets/logo-icon.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/shared/utils/cn";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
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

const posItems: NavigationItem[] = [
  { label: "Venda / caixa", href: "/pos", icon: ShoppingCart },
  { label: "Movimentações", href: "/pos/movements", icon: WalletCards },
  { label: "Fechamento", href: "/pos/closing", icon: ClipboardList },
];

function isRouteActive(pathname: string, href: string, exact = false) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarBrand() {
  return (
    <div className="flex min-w-0 items-center gap-3 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <Image src={logoIcon} alt="" aria-hidden width={34} height={34} className="size-8 shrink-0" />
      <div className="min-w-0 group-data-[collapsible=icon]:hidden">
        <div className="font-display text-lg font-semibold leading-none text-sidebar-foreground">
          Clean<span className="text-primary">Move</span>
        </div>
        <p className="mt-1 truncate text-xs text-sidebar-foreground/60">Gestão operacional</p>
      </div>
    </div>
  );
}

function NavigationGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavigationItem[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isRouteActive(pathname, item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon aria-hidden />
                  <span>{item.label}</span>
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
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isExpanded}
      >
        <ShoppingCart aria-hidden />
        <span>PDV</span>
        <ChevronDown
          aria-hidden
          className={cn("ml-auto transition-transform", isExpanded && "rotate-180")}
        />
      </SidebarMenuButton>

      {isExpanded ? (
        <SidebarMenuSub>
          {posItems.map((item) => (
            <SidebarMenuSubItem key={item.href}>
              <SidebarMenuSubButton
                asChild
                isActive={isRouteActive(pathname, item.href, item.href === "/pos")}
              >
                <Link href={item.href}>
                  <item.icon aria-hidden />
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

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isRouteActive(pathname, item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <PosNavigationItem pathname={pathname} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavigationGroup label="Cadastros" items={registerItems} pathname={pathname} />
        <NavigationGroup label="Gestão" items={managementItems} pathname={pathname} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
