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

vi.mock("@/features/auth/hooks/use-login", () => ({
  useLogin: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

import LoginPage, { metadata } from "./page";

describe("LoginPage", () => {
  it("should expose metadata with title and description", () => {
    expect(metadata.title).toBe("Login");
    expect(metadata.description).toBe("Acesse sua conta CleanMove.");
  });

  it("should render the header and the login form", () => {
    renderWithProviders(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: /bem-vindo de volta/i, level: 1 }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^entrar$/i })).toBeInTheDocument();
  });
});
