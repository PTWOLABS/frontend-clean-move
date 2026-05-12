import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";

import { ApiError } from "@/shared/api/httpClient";
import { createTestQueryClient } from "@/test/test-utils";
import { QueryClientProvider } from "@tanstack/react-query";

const pushMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();
const registerEstablishmentApiMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

vi.mock("../api/establishment", () => ({
  registerEstablishment: (...args: unknown[]) => registerEstablishmentApiMock(...args),
}));

import { useRegisterEstablishment } from "./use-register-establishment";

function wrapper({ children }: { children: ReactNode }) {
  const client = createTestQueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const sampleForm = {
  fullName: "João da Silva",
  phone: "11999991234",
  email: "joao@email.com",
  password: "supersenha",
  cnpj: "12345678000190",
  legalName: "Empresa LTDA",
  tradeName: "Empresa",
  zipCode: "01310100",
  street: "Av. Paulista",
  number: "1000",
  city: "São Paulo",
  state: "SP",
  complement: "Sala 1",
} as const;

describe("useRegisterEstablishment", () => {
  beforeEach(() => {
    pushMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
    registerEstablishmentApiMock.mockReset();
  });

  it("should show success toast and redirect to login on success", async () => {
    registerEstablishmentApiMock.mockResolvedValueOnce({
      establishmentId: "b2955e61-179f-40a4-8852-ef185e4ab671",
    });

    const { result } = renderHook(() => useRegisterEstablishment(), { wrapper });
    result.current.mutate({ ...sampleForm });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(toastSuccessMock).toHaveBeenCalledWith("Cadastro concluído. Faça login para continuar.");
    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  it("should show validation-style toast on 400", async () => {
    registerEstablishmentApiMock.mockRejectedValueOnce(
      new ApiError({ message: "CNPJ já cadastrado", statusCode: 400 }),
    );

    const { result } = renderHook(() => useRegisterEstablishment(), { wrapper });
    result.current.mutate({ ...sampleForm });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toastErrorMock).toHaveBeenCalledWith("CNPJ já cadastrado");
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("should show conflict toast on 409", async () => {
    registerEstablishmentApiMock.mockRejectedValueOnce(
      new ApiError({ message: "Conflict", statusCode: 409 }),
    );

    const { result } = renderHook(() => useRegisterEstablishment(), { wrapper });
    result.current.mutate({ ...sampleForm });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Usuário já cadastrado.");
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("should show generic toast for other api errors", async () => {
    registerEstablishmentApiMock.mockRejectedValueOnce(
      new ApiError({ message: "Boom", statusCode: 500 }),
    );

    const { result } = renderHook(() => useRegisterEstablishment(), { wrapper });
    result.current.mutate({ ...sampleForm });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Não foi possível concluir o cadastro. Tente novamente mais tarde.",
    );
  });

  it("should not call toast when the error is not an ApiError", async () => {
    registerEstablishmentApiMock.mockRejectedValueOnce(new Error("network"));

    const { result } = renderHook(() => useRegisterEstablishment(), { wrapper });
    result.current.mutate({ ...sampleForm });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toastErrorMock).not.toHaveBeenCalled();
  });
});
