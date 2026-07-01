import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/test-utils";
import { PASSWORD_RESET_RESEND_REMINDER_MESSAGE } from "../lib/constants";

import { ForgotPasswordForm } from "./forgot-password-form";

const onSubmitMock = vi.fn();
const onResendClickMock = vi.fn();

function renderForgotPasswordForm({
  isPending = false,
  isSuccess = false,
  showResendReminder = false,
  defaultEmail = null as string | null,
}: {
  isPending?: boolean;
  isSuccess?: boolean;
  showResendReminder?: boolean;
  defaultEmail?: string | null;
} = {}) {
  return renderWithProviders(
    <ForgotPasswordForm
      onSubmit={onSubmitMock}
      isPending={isPending}
      isSuccess={isSuccess}
      onResendClick={onResendClickMock}
      showResendReminder={showResendReminder}
      defaultEmail={defaultEmail}
    />,
  );
}

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    onSubmitMock.mockReset();
    onResendClickMock.mockReset();
  });

  it("should render the email field and submit button", () => {
    renderForgotPasswordForm();

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar link de recuperação/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar ao login/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("should display a validation error when submitting with an invalid email", async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm();

    await user.click(screen.getByRole("button", { name: /enviar link de recuperação/i }));

    expect(await screen.findByText(/informe um e-mail válido/i)).toBeInTheDocument();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it("should call onSubmit with the form data when valid", async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm();

    await user.type(screen.getByLabelText("E-mail"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /enviar link de recuperação/i }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
    expect(onSubmitMock).toHaveBeenCalledWith({
      email: "user@example.com",
    });
  });

  it("should render the success actions without a duplicate heading", () => {
    renderForgotPasswordForm({ isSuccess: true });

    expect(
      screen.queryByRole("heading", { name: /verifique seu e-mail/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar ao login/i })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("button", { name: /não recebeu/i })).toBeInTheDocument();
  });

  it("should call onResendClick when the resend button is clicked", async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm({ isSuccess: true });

    await user.click(screen.getByRole("button", { name: /não recebeu/i }));

    expect(onResendClickMock).toHaveBeenCalledTimes(1);
  });

  it("should show the resend reminder and keep the submitted email prefilled", () => {
    renderForgotPasswordForm({
      showResendReminder: true,
      defaultEmail: "user@example.com",
    });

    expect(screen.getByRole("alert")).toHaveTextContent(PASSWORD_RESET_RESEND_REMINDER_MESSAGE);
    expect(screen.getByLabelText("E-mail")).toHaveValue("user@example.com");
  });

  it("should call onSubmit with the prefilled email in resend mode", async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm({
      showResendReminder: true,
      defaultEmail: "user@example.com",
    });

    await user.click(screen.getByRole("button", { name: /enviar link de recuperação/i }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
    expect(onSubmitMock).toHaveBeenCalledWith({
      email: "user@example.com",
    });
  });
});
