import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/test-utils";

import { ForgotPasswordForm } from "./forgot-password-form";

const mutateMock = vi.fn();
const resetMock = vi.fn();

function renderForgotPasswordForm({
  isPending = false,
  isSuccess = false,
}: {
  isPending?: boolean;
  isSuccess?: boolean;
} = {}) {
  return renderWithProviders(
    <ForgotPasswordForm
      mutate={mutateMock}
      isPending={isPending}
      isSuccess={isSuccess}
      reset={resetMock}
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
    mutateMock.mockReset();
    resetMock.mockReset();
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
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("should call the request mutation with the form data when valid", async () => {
    const user = userEvent.setup();
    renderForgotPasswordForm();

    await user.type(screen.getByLabelText("E-mail"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /enviar link de recuperação/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledTimes(1);
    });
    expect(mutateMock).toHaveBeenCalledWith({
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
});
