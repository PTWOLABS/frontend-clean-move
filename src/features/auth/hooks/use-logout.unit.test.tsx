import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";

import { ApiError } from "@/shared/api/httpClient";
import { createTestQueryClient } from "@/test/test-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const pushMock = vi.fn();
const setAccessTokenMock = vi.fn();
const toastErrorMock = vi.fn();
const signOutApiMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: pushMock,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

vi.mock("../api", () => ({
  signOut: (...args: unknown[]) => signOutApiMock(...args),
}));

vi.mock("@/shared/api/httpClient", async () => {
  const actual =
    await vi.importActual<typeof import("@/shared/api/httpClient")>("@/shared/api/httpClient");
  return {
    ...actual,
    setAccessToken: (...args: unknown[]) => setAccessTokenMock(...args),
  };
});

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { useLogout } from "./use-logout";

function wrapperWithClient(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useLogout", () => {
  beforeEach(() => {
    pushMock.mockReset();
    setAccessTokenMock.mockReset();
    toastErrorMock.mockReset();
    signOutApiMock.mockReset();
  });

  it("should clear token, remove session queries and redirect on success", async () => {
    signOutApiMock.mockResolvedValueOnce(null);
    const client = createTestQueryClient();
    client.setQueryData(QUERY_KEYS.authSession, { id: "1", name: "A", email: "a@b.com" });
    client.setQueryData(["user", "me"], { id: "1", name: "A", email: "a@b.com" });

    const { result } = renderHook(() => useLogout(), { wrapper: wrapperWithClient(client) });
    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(signOutApiMock).toHaveBeenCalledTimes(1);
    expect(setAccessTokenMock).toHaveBeenCalledWith(null);
    expect(client.getQueryData(QUERY_KEYS.authSession)).toBeUndefined();
    expect(client.getQueryData(["user", "me"])).toBeUndefined();
    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  it("should show toast and not redirect on api error", async () => {
    signOutApiMock.mockRejectedValueOnce(new ApiError({ message: "Falhou", statusCode: 500 }));
    const client = createTestQueryClient();

    const { result } = renderHook(() => useLogout(), { wrapper: wrapperWithClient(client) });
    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Falhou");
    expect(pushMock).not.toHaveBeenCalled();
    expect(setAccessTokenMock).not.toHaveBeenCalled();
  });
});
