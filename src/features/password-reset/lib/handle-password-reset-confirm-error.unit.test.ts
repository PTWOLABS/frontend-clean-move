import { describe, expect, it, vi, beforeEach } from "vitest";
import type { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";

import { INVALID_PASSWORD_RESET_TOKEN_MESSAGE } from "./constants";
import type { ResetPasswordFormValues } from "../schemas/reset-password-schema";
import { handlePasswordResetConfirmError } from "./handle-password-reset-confirm-error";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("handlePasswordResetConfirmError", () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
  });

  it("should set field errors for zod validation issues", () => {
    const setError = vi.fn() as unknown as UseFormSetError<ResetPasswordFormValues>;

    handlePasswordResetConfirmError(
      new ApiError({
        statusCode: 400,
        message: "Validation failed",
        payload: {
          message: "Validation failed",
          issues: [
            {
              code: "too_small",
              message: "Too small: expected string to have >=8 characters",
              path: "newPassword",
            },
          ],
        },
      }),
      setError,
    );

    expect(setError).toHaveBeenCalledWith("newPassword", {
      type: "server",
      message: "A senha deve ter pelo menos 8 caracteres.",
    });
    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível concluir a operação.",
      expect.objectContaining({
        description: "A senha deve ter pelo menos 8 caracteres.",
      }),
    );
  });

  it("should not show toast for invalid password reset token errors", () => {
    const setError = vi.fn() as unknown as UseFormSetError<ResetPasswordFormValues>;

    handlePasswordResetConfirmError(
      new ApiError({
        statusCode: 400,
        message: INVALID_PASSWORD_RESET_TOKEN_MESSAGE,
        payload: { message: INVALID_PASSWORD_RESET_TOKEN_MESSAGE },
      }),
      setError,
    );

    expect(setError).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("should show rate limit toast for 429 errors", () => {
    const setError = vi.fn() as unknown as UseFormSetError<ResetPasswordFormValues>;

    handlePasswordResetConfirmError(
      new ApiError({
        statusCode: 429,
        message: "ThrottlerException: Too Many Requests",
        payload: { message: "ThrottlerException: Too Many Requests" },
      }),
      setError,
    );

    expect(setError).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    );
  });

  it("should show generic feedback toast for unknown errors", () => {
    const setError = vi.fn() as unknown as UseFormSetError<ResetPasswordFormValues>;

    handlePasswordResetConfirmError(new Error("Network error"), setError);

    expect(setError).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível atualizar a senha.",
      expect.objectContaining({
        description: "Tente novamente em alguns instantes.",
      }),
    );
  });
});
