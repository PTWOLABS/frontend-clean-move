/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest";

const httpClientMock = vi.fn();

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: (...args: unknown[]) => httpClientMock(...args),
}));

import { confirmPasswordReset, requestPasswordReset } from "./index";

describe("password-reset/api", () => {
  beforeEach(() => {
    httpClientMock.mockReset();
  });

  it("should send a post to /auth/password-reset/request with the email", async () => {
    httpClientMock.mockResolvedValueOnce({
      message: "If an account exists for this email, we will send a password reset link.",
    });

    const response = await requestPasswordReset({ email: "user@example.com" });

    expect(httpClientMock).toHaveBeenCalledWith("/auth/password-reset/request", {
      method: "POST",
      body: { email: "user@example.com" },
    });
    expect(response).toEqual({
      message: "If an account exists for this email, we will send a password reset link.",
    });
  });

  it("should send a post to /auth/password-reset/confirm with token and newPassword", async () => {
    httpClientMock.mockResolvedValueOnce({
      message: "Password reset successfully.",
    });

    const response = await confirmPasswordReset({
      token: "opaque-reset-token",
      newPassword: "new-strong-password",
    });

    expect(httpClientMock).toHaveBeenCalledWith("/auth/password-reset/confirm", {
      method: "POST",
      body: {
        token: "opaque-reset-token",
        newPassword: "new-strong-password",
      },
    });
    expect(response).toEqual({
      message: "Password reset successfully.",
    });
  });
});
