import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/test-utils";

const confirmPasswordResetMock = vi.fn();
const resetMutationMock = vi.fn();

vi.mock("../hooks/use-confirm-password-reset", () => ({
  useConfirmPasswordReset: () => ({
    mutate: confirmPasswordResetMock,
    isPending: false,
    error: null,
    reset: resetMutationMock,
  }),
  isInvalidPasswordResetTokenError: () => false,
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

import { ResetPasswordForm } from "./reset-password-form";

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    confirmPasswordResetMock.mockReset();
    resetMutationMock.mockReset();
  });

  it("should render password fields and submit button", () => {
    renderWithProviders(<ResetPasswordForm token="valid-token" />);

    expect(screen.getByLabelText("Nova senha")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar nova senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /redefinir senha/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar ao login/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("should call the confirm mutation with token and new password when valid", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordForm token="valid-token" />);

    await user.type(screen.getByLabelText("Nova senha"), "senhaForte");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "senhaForte");
    await user.click(screen.getByRole("button", { name: /redefinir senha/i }));

    await waitFor(() => {
      expect(confirmPasswordResetMock).toHaveBeenCalledTimes(1);
    });
    expect(confirmPasswordResetMock).toHaveBeenCalledWith(
      {
        newPassword: "senhaForte",
        confirmPassword: "senhaForte",
        token: "valid-token",
      },
      expect.objectContaining({
        onError: expect.any(Function),
      }),
    );
  });
});
