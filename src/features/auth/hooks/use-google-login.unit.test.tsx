import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";

import { ApiError } from "@/shared/api/httpClient";
import { createTestQueryClient } from "@/test/test-utils";
import { QueryClientProvider } from "@tanstack/react-query";

const pushMock = vi.fn();
const setAccessTokenMock = vi.fn();
const toastErrorMock = vi.fn();
const loginWithGoogleApiMock = vi.fn();

vi.mock("@bprogress/next", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

vi.mock("../api", () => ({
  loginWithGoogle: (...args: unknown[]) => loginWithGoogleApiMock(...args),
}));

vi.mock("@/shared/api/httpClient", async () => {
  const actual =
    await vi.importActual<typeof import("@/shared/api/httpClient")>("@/shared/api/httpClient");
  return {
    ...actual,
    setAccessToken: (...args: unknown[]) => setAccessTokenMock(...args),
  };
});

import { useGoogleLogin } from "./use-google-login";

function wrapper({ children }: { children: ReactNode }) {
  const client = createTestQueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useGoogleLogin", () => {
  beforeEach(() => {
    pushMock.mockReset();
    setAccessTokenMock.mockReset();
    toastErrorMock.mockReset();
    loginWithGoogleApiMock.mockReset();
  });

  it("should persist the access token and redirect to /onboarding when onboarding is pending", async () => {
    loginWithGoogleApiMock.mockResolvedValueOnce({
      accessToken: "google-access",
      onboardingCompletedAt: null,
      userId: "u-1",
    });

    const { result } = renderHook(() => useGoogleLogin(), { wrapper });
    result.current.mutate({ idToken: "id-jwt", role: "ESTABLISHMENT" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(loginWithGoogleApiMock.mock.calls[0]?.[0]).toEqual({
      idToken: "id-jwt",
      role: "ESTABLISHMENT",
    });
    expect(setAccessTokenMock).toHaveBeenCalledWith("google-access");
    expect(pushMock).toHaveBeenCalledWith("/onboarding");
  });

  it("should redirect to /dashboard when onboarding is completed", async () => {
    loginWithGoogleApiMock.mockResolvedValueOnce({
      accessToken: "google-access",
      onboardingCompletedAt: "2026-06-11T10:00:00.000Z",
      userId: "u-1",
    });

    const { result } = renderHook(() => useGoogleLogin(), { wrapper });
    result.current.mutate({ idToken: "id-jwt", role: "ESTABLISHMENT" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(setAccessTokenMock).toHaveBeenCalledWith("google-access");
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });

  it("should show a specific toast when the api responds with 400", async () => {
    loginWithGoogleApiMock.mockRejectedValueOnce(
      new ApiError({ message: "Bad Request", statusCode: 400 }),
    );

    const { result } = renderHook(() => useGoogleLogin(), { wrapper });
    result.current.mutate({ idToken: "bad", role: "ESTABLISHMENT" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Não foi possível autenticar com Google. Tente novamente.",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
