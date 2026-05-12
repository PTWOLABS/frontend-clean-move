/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest";

const httpClientMock = vi.fn();

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: (...args: unknown[]) => httpClientMock(...args),
}));

import { getCurrentUser, login, loginWithGoogle } from "./index";

describe("auth/api", () => {
  beforeEach(() => {
    httpClientMock.mockReset();
  });

  it("should send a post to /auth/login with the payload", async () => {
    httpClientMock.mockResolvedValueOnce({
      accessToken: "abc",
      userId: "1",
    });

    const response = await login({ email: "fulano@email.com", password: "supersenha" });

    expect(httpClientMock).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "fulano@email.com", password: "supersenha" },
    });
    expect(response).toEqual({
      accessToken: "abc",
      userId: "1",
    });
  });

  it("should send a post to /auth/google with idToken", async () => {
    httpClientMock.mockResolvedValueOnce({
      accessToken: "jwt",
      userId: "u-2",
    });

    const response = await loginWithGoogle({ idToken: "google-id-jwt" });

    expect(httpClientMock).toHaveBeenCalledWith("/auth/google", {
      method: "POST",
      body: { idToken: "google-id-jwt" },
    });
    expect(response).toEqual({ accessToken: "jwt", userId: "u-2" });
  });

  it("should call get on /auth/me to fetch the current user", async () => {
    httpClientMock.mockResolvedValueOnce({
      id: "1",
      name: "Fulano",
      email: "fulano@email.com",
    });

    const response = await getCurrentUser();

    expect(httpClientMock).toHaveBeenCalledWith("/auth/me");
    expect(response).toEqual({ id: "1", name: "Fulano", email: "fulano@email.com" });
  });
});
