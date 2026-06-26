import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/test-utils";
import { PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE } from "../lib/constants";

const requestPasswordResetMock = vi.fn();
const resetMock = vi.fn();
let isSuccess = false;

vi.mock("../hooks/use-request-password-reset", () => ({
  useRequestPasswordReset: () => ({
    mutate: requestPasswordResetMock,
    isPending: false,
    isSuccess,
    reset: resetMock,
  }),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

import { ForgotPasswordForm } from "./forgot-password-form";

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    requestPasswordResetMock.mockReset();
    resetMock.mockReset();
    isSuccess = false;
  });

  it("should render the email field and submit button", () => {
    renderWithProviders(<ForgotPasswordForm />);

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enviar link de recuperação/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar ao login/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("should display a validation error when submitting with an invalid email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />);

    await user.click(screen.getByRole("button", { name: /enviar link de recuperação/i }));

    expect(await screen.findByText(/informe um e-mail válido/i)).toBeInTheDocument();
    expect(requestPasswordResetMock).not.toHaveBeenCalled();
  });

  it("should call the request mutation with the form data when valid", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("E-mail"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /enviar link de recuperação/i }));

    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledTimes(1);
    });
    expect(requestPasswordResetMock).toHaveBeenCalledWith({
      email: "user@example.com",
    });
  });

  it("should render the success state when the request succeeds", () => {
    isSuccess = true;

    renderWithProviders(<ForgotPasswordForm />);

    expect(screen.getByRole("heading", { name: /verifique seu e-mail/i })).toBeInTheDocument();
    expect(screen.getByText(PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar ao login/i })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("button", { name: /não recebeu/i })).toBeInTheDocument();
  });
});
