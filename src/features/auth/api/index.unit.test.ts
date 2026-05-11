/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest";

const httpClientMock = vi.fn();

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: (...args: unknown[]) => httpClientMock(...args),
}));

import { getCurrentUser, login } from "./index";

describe("auth/api", () => {
  beforeEach(() => {
    httpClientMock.mockReset();
  });

  it("should send a post to /auth/login with the payload", async () => {
    httpClientMock.mockResolvedValueOnce({
      accessToken: "abc",
      user: { id: "1", name: "Fulano", email: "fulano@email.com" },
    });

    const response = await login({ email: "fulano@email.com", password: "supersenha" });

    expect(httpClientMock).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "fulano@email.com", password: "supersenha" },
    });
    expect(response).toEqual({
      accessToken: "abc",
      user: { id: "1", name: "Fulano", email: "fulano@email.com" },
    });
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
