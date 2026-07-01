import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/test-utils";
import { PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE } from "../lib/constants";

import { ForgotPasswordHeader } from "./forgot-password-header";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

describe("ForgotPasswordHeader", () => {
  it("should render the default heading and description", () => {
    renderWithProviders(<ForgotPasswordHeader />);

    expect(screen.getByRole("heading", { name: /esqueceu sua senha/i })).toBeInTheDocument();
    expect(
      screen.getByText(/informe seu e-mail e enviaremos um link para redefinir sua senha/i),
    ).toBeInTheDocument();
  });

  it("should render the success heading and description when isSuccess is true", () => {
    renderWithProviders(<ForgotPasswordHeader isSuccess />);

    expect(screen.getByRole("heading", { name: /verifique seu e-mail/i })).toBeInTheDocument();
    expect(screen.getByText(PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /esqueceu sua senha/i })).not.toBeInTheDocument();
  });
});
