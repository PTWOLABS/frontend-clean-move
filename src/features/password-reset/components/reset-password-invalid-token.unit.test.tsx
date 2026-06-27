import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

import { ResetPasswordInvalidToken } from "./reset-password-invalid-token";

describe("ResetPasswordInvalidToken", () => {
  it("should render the invalid token message and links", () => {
    render(<ResetPasswordInvalidToken />);

    expect(
      screen.getByRole("heading", { name: /link de recuperação inválido/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /solicitar novo link/i })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    expect(screen.getByRole("link", { name: /voltar ao login/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
