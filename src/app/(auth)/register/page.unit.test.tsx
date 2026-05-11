import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/test-utils";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

vi.mock("@/features/register/api/brasilapi", () => ({
  fetchCompanyByCnpj: vi.fn(),
}));
vi.mock("@/features/register/api/viacep", () => ({
  fetchAddressByZipCode: vi.fn(),
}));

import RegisterPage from "./page";

describe("RegisterPage", () => {
  it("should render the registerform starting at the account step", () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByRole("heading", { name: /crie sua conta/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
    expect(screen.getByLabelText("Telefone")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /fazer login/i })).toHaveAttribute("href", "/login");
  });
});
