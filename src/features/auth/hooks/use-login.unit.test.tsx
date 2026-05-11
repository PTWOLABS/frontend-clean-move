import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";

import { ApiError } from "@/shared/api/httpClient";
import { createTestQueryClient } from "@/test/test-utils";
import { QueryClientProvider } from "@tanstack/react-query";

const pushMock = vi.fn();
const setAccessTokenMock = vi.fn();
const toastErrorMock = vi.fn();
const loginApiMock = vi.fn();

vi.mock("next/navigation", () => ({
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
  login: (...args: unknown[]) => loginApiMock(...args),
}));

vi.mock("@/shared/api/httpClient", async () => {
  const actual =
    await vi.importActual<typeof import("@/shared/api/httpClient")>("@/shared/api/httpClient");
  return {
    ...actual,
    setAccessToken: (...args: unknown[]) => setAccessTokenMock(...args),
  };
});

import { useLogin } from "./use-login";

function wrapper({ children }: { children: ReactNode }) {
  const client = createTestQueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useLogin", () => {
  beforeEach(() => {
    pushMock.mockReset();
    setAccessTokenMock.mockReset();
    toastErrorMock.mockReset();
    loginApiMock.mockReset();
  });

  it("should persist the access token and redirect to /home on success", async () => {
    loginApiMock.mockResolvedValueOnce({
      accessToken: "token-de-acesso",
      user: { id: "1", name: "Fulano", email: "fulano@email.com" },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate({ email: "fulano@email.com", password: "supersenha" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(setAccessTokenMock).toHaveBeenCalledWith("token-de-acesso");
    expect(pushMock).toHaveBeenCalledWith("/home");
  });

  it("should show an invalid credentials toast when the api responds with 400", async () => {
    loginApiMock.mockRejectedValueOnce(
      new ApiError({ message: "Credenciais inválidas", statusCode: 400 }),
    );

    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate({ email: "fulano@email.com", password: "senha-errada" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Credenciais inválidas");
    expect(pushMock).not.toHaveBeenCalled();
    expect(setAccessTokenMock).not.toHaveBeenCalled();
  });

  it("should show a generic unavailability toast for other api errors", async () => {
    loginApiMock.mockRejectedValueOnce(new ApiError({ message: "Boom", statusCode: 500 }));

    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate({ email: "fulano@email.com", password: "supersenha" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Não foi possível fazer login. Tente novamente mais tarde",
    );
  });

  it("should not call toast.error when the error is not an api error", async () => {
    loginApiMock.mockRejectedValueOnce(new Error("network failure"));

    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate({ email: "fulano@email.com", password: "supersenha" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toastErrorMock).not.toHaveBeenCalled();
  });
});
