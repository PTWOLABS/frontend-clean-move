# Private Navigation Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the authenticated CleanMove grouped sidebar with a PDV dropdown and accented Portuguese labels.

**Architecture:** Add a focused client-side `AppSidebar` for pathname-aware navigation state, then compose it inside the existing `AppShell` used by private routes. Preserve a separate public shell so public pages do not inherit the authenticated navigation.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui sidebar primitives, lucide-react, Vitest, Testing Library.

---

## File Structure

- Create `src/components/app-sidebar.tsx`: client component with static navigation config, active-state helpers, PDV dropdown state, and shadcn sidebar markup.
- Create `src/components/app-sidebar.unit.test.tsx`: tests labels, hrefs, active parent state, and PDV dropdown behavior.
- Modify `src/components/app-shell.tsx`: private app frame with providers, sidebar provider, sidebar, header trigger, theme toggle, and constrained content.
- Create `src/components/public-shell.tsx`: preserves the current simple header/main shell for public routes.
- Modify `src/app/(public)/layout.tsx`: switch public routes from `AppShell` to `PublicShell`.
- Create `src/app/(private)/services/page.tsx`: expose the existing Serviços list at the approved `/services` route while leaving `/servicos` untouched.

## Task 1: Build The Sidebar Component

**Files:**
- Create: `src/components/app-sidebar.tsx`
- Create: `src/components/app-sidebar.unit.test.tsx`

- [ ] **Step 1: Write the sidebar tests**

Create `src/components/app-sidebar.unit.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import { SidebarProvider } from "@/components/ui/sidebar";
import { renderWithProviders } from "@/test/test-utils";

let pathname = "/dashboard";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

vi.mock("@/shared/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

import { AppSidebar } from "./app-sidebar";

function renderSidebar(path = "/dashboard") {
  pathname = path;

  return renderWithProviders(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>,
  );
}

describe("AppSidebar", () => {
  it("should render the grouped navigation labels with correct accents", () => {
    renderSidebar();

    expect(screen.getByText("Operação")).toBeInTheDocument();
    expect(screen.getByText("Cadastros")).toBeInTheDocument();
    expect(screen.getByText("Gestão")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: /agenda/i })).toHaveAttribute("href", "/agenda");
    expect(screen.getByRole("link", { name: /agendamentos/i })).toHaveAttribute(
      "href",
      "/appointments",
    );
    expect(screen.getByRole("link", { name: /clientes/i })).toHaveAttribute("href", "/customers");
    expect(screen.getByRole("link", { name: /veículos/i })).toHaveAttribute("href", "/vehicles");
    expect(screen.getByRole("link", { name: /serviços/i })).toHaveAttribute("href", "/services");
    expect(screen.getByRole("link", { name: /orçamentos/i })).toHaveAttribute(
      "href",
      "/budgets",
    );
    expect(screen.getByRole("link", { name: /relatórios/i })).toHaveAttribute("href", "/reports");
    expect(screen.getByRole("link", { name: /configurações/i })).toHaveAttribute(
      "href",
      "/settings",
    );
  });

  it("should highlight parent modules for nested routes", () => {
    renderSidebar("/customers/123/edit");

    expect(screen.getByRole("link", { name: /clientes/i })).toHaveAttribute("data-active", "true");
  });

  it("should expand PDV automatically for nested PDV routes", () => {
    renderSidebar("/pos/closing");

    expect(screen.getByRole("button", { name: /pdv/i })).toHaveAttribute("data-active", "true");
    expect(screen.getByRole("link", { name: /venda \/ caixa/i })).toHaveAttribute("href", "/pos");
    expect(screen.getByRole("link", { name: /movimentações/i })).toHaveAttribute(
      "href",
      "/pos/movements",
    );
    expect(screen.getByRole("link", { name: /fechamento/i })).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  it("should toggle the PDV dropdown by keyboard-accessible button", async () => {
    const user = userEvent.setup();
    renderSidebar("/dashboard");

    expect(screen.queryByRole("link", { name: /venda \/ caixa/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /pdv/i }));

    expect(screen.getByRole("link", { name: /venda \/ caixa/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run: `npm run test:run -- src/components/app-sidebar.unit.test.tsx`

Expected: FAIL because `src/components/app-sidebar.tsx` does not exist.

- [ ] **Step 3: Implement `AppSidebar`**

Create `src/components/app-sidebar.tsx`:

```tsx
"use client";

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
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
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

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationGroup({ label, items }: { label: string; items: NavigationItem[] }) {
  const pathname = usePathname();

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

function PosNavigationItem() {
  const pathname = usePathname();
  const isPosActive = isRouteActive(pathname, "/pos");
  const [isOpen, setIsOpen] = useState(isPosActive);

  useEffect(() => {
    if (isPosActive) {
      setIsOpen(true);
    }
  }, [isPosActive]);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        isActive={isPosActive}
        tooltip="PDV"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <ShoppingCart aria-hidden />
        <span>PDV</span>
        <ChevronDown
          aria-hidden
          className={cn("ml-auto transition-transform", isOpen && "rotate-180")}
        />
      </SidebarMenuButton>

      {isOpen ? (
        <SidebarMenuSub>
          {posItems.map((item) => (
            <SidebarMenuSubItem key={item.href}>
              <SidebarMenuSubButton asChild isActive={isRouteActive(pathname, item.href)}>
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
        <BrandLogo />
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
              <PosNavigationItem />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavigationGroup label="Cadastros" items={registerItems} />
        <NavigationGroup label="Gestão" items={managementItems} />
      </SidebarContent>
    </Sidebar>
  );
}
```

- [ ] **Step 4: Run the sidebar test**

Run: `npm run test:run -- src/components/app-sidebar.unit.test.tsx`

Expected: PASS.

## Task 2: Compose The Private Shell And Preserve Public Shell

**Files:**
- Modify: `src/components/app-shell.tsx`
- Create: `src/components/public-shell.tsx`
- Modify: `src/app/(public)/layout.tsx`

- [ ] **Step 1: Preserve the current public shell**

Create `src/components/public-shell.tsx` using the current `AppShell` structure:

```tsx
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { AppQueryClientProvider } from "@/shared/providers/query-client-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";

export function PublicShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ThemeProvider>
      <AppQueryClientProvider>
        <div className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-border-subtle bg-card/70 px-6 py-4 shadow-xs backdrop-blur">
            <div className="font-display text-lg font-bold">CleanMove</div>
            <ThemeToggle />
          </header>
          <main className="container mx-auto flex-1 px-6 py-8">{children}</main>
        </div>
      </AppQueryClientProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 2: Point public routes to `PublicShell`**

Modify `src/app/(public)/layout.tsx`:

```tsx
import type { ReactNode } from "react";

import { PublicShell } from "@/components/public-shell";

export default function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <PublicShell>{children}</PublicShell>;
}
```

- [ ] **Step 3: Update `AppShell` to be the private sidebar frame**

Modify `src/components/app-shell.tsx`:

```tsx
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppQueryClientProvider } from "@/shared/providers/query-client-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";

export function AppShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ThemeProvider>
      <AppQueryClientProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarRail />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border-subtle bg-background/90 px-4 backdrop-blur md:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                <div>
                  <p className="font-display text-base font-semibold leading-none">CleanMove</p>
                  <p className="text-xs text-muted-foreground">Gestão operacional</p>
                </div>
              </div>
              <ThemeToggle />
            </header>
            <main className="container mx-auto flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </AppQueryClientProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 4: Run TypeScript for composition errors**

Run: `npm run typecheck`

Expected: PASS.

## Task 3: Expose The Approved `/services` Route

**Files:**
- Create: `src/app/(private)/services/page.tsx`

- [ ] **Step 1: Create the services route page**

Create `src/app/(private)/services/page.tsx`:

```tsx
import { ServicosList } from "@/features/service/components/servicos-list";

export default function ServicesPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Serviços</h2>
        <p className="text-sm text-muted-foreground">
          Lista de serviços obtidos da API externa com React Query.
        </p>
      </header>

      <ServicosList />
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript**

Run: `npm run typecheck`

Expected: PASS.

## Task 4: Validate The Feature

**Files:**
- Validate existing changed files.

- [ ] **Step 1: Run targeted unit tests**

Run: `npm run test:run -- src/components/app-sidebar.unit.test.tsx`

Expected: PASS.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 3: Run TypeScript**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Manual responsive check**

Run: `npm run dev`

Check:

- Desktop private pages show the grouped sidebar by default.
- Mobile widths show the header trigger and sidebar Sheet.
- `/customers/123/edit` highlights Clientes when that route exists.
- `/pos/closing` opens PDV and highlights Fechamento when that route exists.
- Public routes still use the simple public shell and do not show the authenticated sidebar.

## Self-Review

- Spec coverage: grouped sidebar, PDV dropdown, accented labels, active state, mobile sidebar behavior, public/private shell separation, and `/services` navigation access are covered.
- Placeholder scan: no unfinished markers or unspecified implementation steps remain.
- Type consistency: `NavigationItem`, `isRouteActive`, `AppSidebar`, `AppShell`, `PublicShell`, and `ServicesPage` names are consistent across tasks.
