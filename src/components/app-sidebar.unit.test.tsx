import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

import { SidebarProvider } from "@/components/ui/sidebar";
import { renderWithProviders } from "@/test/test-utils";

const mockNavigation = vi.hoisted(() => ({
  pathname: "/dashboard",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
}));

vi.mock("@/shared/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/features/user/hooks/use-current-user", () => ({
  useCurrentUser: () => ({
    data: {
      id: "user-1",
      name: "Ana Lima",
      email: "ana@cleanmove.com",
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...props} />;
  },
}));

import { AppSidebar } from "./app-sidebar";

function renderSidebar(path = "/dashboard") {
  mockNavigation.pathname = path;

  return renderWithProviders(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>,
  );
}

describe("AppSidebar", () => {
  it("should render the grouped navigation labels with correct accents", () => {
    renderSidebar();

    expect(screen.getByRole("button", { name: /alternar menu lateral/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^toggle sidebar$/i })).not.toBeInTheDocument();
    expect(screen.getByText("Operação")).toBeInTheDocument();
    expect(screen.getByText("Cadastros")).toBeInTheDocument();
    expect(screen.getByText("Gestão")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /^agenda$/i })).toHaveAttribute("href", "/agenda");
    expect(screen.getByRole("link", { name: /^agendamentos$/i })).toHaveAttribute(
      "href",
      "/appointments",
    );
    expect(screen.getByRole("link", { name: /clientes/i })).toHaveAttribute("href", "/customers");
    expect(screen.getByRole("link", { name: /veículos/i })).toHaveAttribute("href", "/vehicles");
    expect(screen.getByRole("link", { name: /serviços/i })).toHaveAttribute("href", "/services");
    expect(screen.getByRole("link", { name: /orçamentos/i })).toHaveAttribute("href", "/budgets");
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

  it("should render the user footer menu and open account actions", async () => {
    const user = userEvent.setup();
    renderSidebar();

    expect(screen.getByText("Ana Lima")).toBeInTheDocument();
    expect(screen.getByText("ana@cleanmove.com")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /abrir menu da conta de ana lima/i }));

    expect(await screen.findByRole("menuitem", { name: /conta/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /notificações/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /configurações/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /sair/i })).toBeInTheDocument();
  });
});
