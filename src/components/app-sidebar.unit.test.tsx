import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SidebarProvider } from "@/components/ui/sidebar";
import { renderWithProviders } from "@/test/test-utils";

const mockNavigation = vi.hoisted(() => ({
  pathname: "/dashboard",
}));
const logoutMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => mockNavigation.pathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
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

vi.mock("@/features/auth/hooks/use-logout", () => ({
  useLogout: () => ({
    mutate: logoutMock,
    isPending: false,
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
  beforeEach(() => {
    logoutMock.mockClear();
  });

  it("should render the grouped navigation labels with correct accents", () => {
    renderSidebar();

    expect(screen.getByRole("button", { name: /alternar menu lateral/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^toggle sidebar$/i })).not.toBeInTheDocument();
    expect(screen.getByText("Operação")).toBeInTheDocument();
    expect(screen.getByText("Cadastros")).toBeInTheDocument();
    expect(screen.getByText("Gestão")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /^agenda$/i })).toHaveAttribute("href", "/agenda");
    expect(screen.getByRole("link", { name: /^calendário$/i })).toHaveAttribute(
      "href",
      "/appointments",
    );
    expect(screen.getByRole("link", { name: /clientes/i })).toHaveAttribute("href", "/customers");
    expect(screen.getByRole("link", { name: /veículos/i })).toHaveAttribute("href", "/vehicles");
    expect(screen.getByRole("link", { name: /serviços/i })).toHaveAttribute("href", "/services");
    expect(screen.getByRole("link", { name: /orçamentos/i })).toHaveAttribute("href", "/quotes");
    expect(screen.queryByRole("link", { name: /relatórios/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /configurações/i })).toHaveAttribute(
      "href",
      "/settings",
    );
  });

  it("should highlight parent modules for nested routes", () => {
    renderSidebar("/customers/123/edit");

    expect(screen.getByRole("link", { name: /clientes/i })).toHaveAttribute("data-active", "true");
  });

  it("should keep the PDV navigation hidden for nested PDV routes", () => {
    renderSidebar("/pos/closing");

    expect(screen.queryByRole("button", { name: /pdv/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /venda \/ caixa/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /movimentações/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /fechamento/i })).not.toBeInTheDocument();
  });

  it("should not render the hidden PDV dropdown trigger", () => {
    renderSidebar("/dashboard");

    expect(screen.queryByRole("button", { name: /pdv/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /venda \/ caixa/i })).not.toBeInTheDocument();
  });

  it("should render the logout footer action", async () => {
    const user = userEvent.setup();
    renderSidebar();

    const logoutButton = screen.getByRole("button", { name: /sair/i });

    expect(logoutButton).toBeInTheDocument();
    await user.click(logoutButton);
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
