import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { FormProvider, useForm } from "react-hook-form";
import type { ReactNode } from "react";

import { createTestQueryClient } from "@/test/test-utils";
import { QueryClientProvider } from "@tanstack/react-query";

const fetchCompanyByCnpjMock = vi.fn();

vi.mock("../api/brasilapi", () => ({
  fetchCompanyByCnpj: (...args: unknown[]) => fetchCompanyByCnpjMock(...args),
}));

import { useCnpjAutofill } from "./use-cnpj-autofill";
import { type CompanyStepValues } from "../schemas/register-schema";

function buildWrapper(initialCnpj = "") {
  const client = createTestQueryClient();
  let methodsRef: ReturnType<typeof useForm<CompanyStepValues>> | null = null;

  function FormProviderWrapper({ children }: { children: ReactNode }) {
    const methods = useForm<CompanyStepValues>({
      defaultValues: { cnpj: initialCnpj, legalName: "", tradeName: "" },
    });
    methodsRef = methods;
    return <FormProvider {...methods}>{children}</FormProvider>;
  }

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <FormProviderWrapper>{children}</FormProviderWrapper>
      </QueryClientProvider>
    );
  }

  return {
    Wrapper,
    getMethods: () => {
      if (!methodsRef) throw new Error("Form methods not yet ready");
      return methodsRef;
    },
  };
}

describe("useCnpjAutofill", () => {
  beforeEach(() => {
    fetchCompanyByCnpjMock.mockReset();
  });

  it("should not trigger the lookup when the cnpj has fewer than 14 digits", () => {
    const { Wrapper } = buildWrapper("12345");
    renderHook(() => useCnpjAutofill(), { wrapper: Wrapper });
    expect(fetchCompanyByCnpjMock).not.toHaveBeenCalled();
  });

  it("should fill legalname and tradename on a successful lookup", async () => {
    fetchCompanyByCnpjMock.mockResolvedValue({
      legalName: "Empresa LTDA",
      tradeName: "Empresa",
    });

    const { Wrapper, getMethods } = buildWrapper();
    const { result } = renderHook(() => useCnpjAutofill(), { wrapper: Wrapper });

    act(() => {
      getMethods().setValue("cnpj", "12.345.678/0001-90");
    });

    await waitFor(() => expect(fetchCompanyByCnpjMock).toHaveBeenCalled());
    await waitFor(() => {
      expect(getMethods().getValues("legalName")).toBe("Empresa LTDA");
      expect(getMethods().getValues("tradeName")).toBe("Empresa");
    });

    expect(result.current.hasCompanyFetchError).toBe(false);
  });

  it("should set 'cnpj não encontrado' error when the api returns null", async () => {
    fetchCompanyByCnpjMock.mockResolvedValue(null);
    const { Wrapper, getMethods } = buildWrapper();
    renderHook(() => useCnpjAutofill(), { wrapper: Wrapper });

    act(() => {
      getMethods().setValue("cnpj", "12.345.678/0001-90");
    });

    await waitFor(() => {
      expect(getMethods().formState.errors.cnpj?.message).toBe("CNPJ não encontrado.");
    });
  });

  it("should expose hascompanyfetcherror when the lookup fails", async () => {
    fetchCompanyByCnpjMock.mockRejectedValue(new Error("erro"));
    const { Wrapper, getMethods } = buildWrapper();
    const { result } = renderHook(() => useCnpjAutofill(), { wrapper: Wrapper });

    act(() => {
      getMethods().setValue("cnpj", "12.345.678/0001-90");
    });

    await waitFor(() => expect(result.current.hasCompanyFetchError).toBe(true));
  });
});
