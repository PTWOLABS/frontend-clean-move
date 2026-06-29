import { describe, expect, it, vi } from "vitest";
import type { UseFormSetError } from "react-hook-form";

import { ApiError } from "@/shared/api/httpClient";

import type { ResetPasswordFormValues } from "../schemas/reset-password-schema";
import { handlePasswordResetConfirmError } from "./handle-password-reset-confirm-error";

describe("handlePasswordResetConfirmError", () => {
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
  });
});
