import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { FormProvider, useForm } from "react-hook-form";
import type { ReactNode } from "react";

import { createTestQueryClient } from "@/test/test-utils";
import { QueryClientProvider } from "@tanstack/react-query";

const fetchAddressByZipCodeMock = vi.fn();

vi.mock("../api/viacep", () => ({
  fetchAddressByZipCode: (...args: unknown[]) => fetchAddressByZipCodeMock(...args),
}));

import { useZipCodeAutofill } from "./use-zipcode-autofill";
import { type AddressStepValues } from "../schemas/register-schema";

const emptyAddress: AddressStepValues = {
  zipCode: "",
  street: "",
  number: "",
  city: "",
  state: "",
  complement: "",
};

function buildWrapper(initialValues: Partial<AddressStepValues> = {}) {
  const client = createTestQueryClient();
  let methodsRef: ReturnType<typeof useForm<AddressStepValues>> | null = null;

  function FormProviderWrapper({ children }: { children: ReactNode }) {
    const methods = useForm<AddressStepValues>({
      defaultValues: { ...emptyAddress, ...initialValues },
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
      if (!methodsRef) throw new Error("Form methods not ready");
      return methodsRef;
    },
  };
}

describe("useZipCodeAutofill", () => {
  beforeEach(() => {
    fetchAddressByZipCodeMock.mockReset();
  });

  it("should not trigger the lookup when the zipcode has fewer than 8 digits", () => {
    const { Wrapper } = buildWrapper({ zipCode: "1234" });
    renderHook(() => useZipCodeAutofill(), { wrapper: Wrapper });
    expect(fetchAddressByZipCodeMock).not.toHaveBeenCalled();
  });

  it("should fill street, city and state on a successful lookup", async () => {
    fetchAddressByZipCodeMock.mockResolvedValue({
      street: "Av. Paulista",
      city: "São Paulo",
      state: "SP",
      complement: "Sala 1",
    });

    const { Wrapper, getMethods } = buildWrapper();
    renderHook(() => useZipCodeAutofill(), { wrapper: Wrapper });

    act(() => {
      getMethods().setValue("zipCode", "01310-100");
    });

    await waitFor(() => expect(fetchAddressByZipCodeMock).toHaveBeenCalled());
    await waitFor(() => {
      expect(getMethods().getValues("street")).toBe("Av. Paulista");
      expect(getMethods().getValues("city")).toBe("São Paulo");
      expect(getMethods().getValues("state")).toBe("SP");
      expect(getMethods().getValues("complement")).toBe("Sala 1");
    });
  });

  it("should preserve the complement already filled by the user", async () => {
    fetchAddressByZipCodeMock.mockResolvedValue({
      street: "Av. Paulista",
      city: "São Paulo",
      state: "SP",
      complement: "Andar 2",
    });

    const { Wrapper, getMethods } = buildWrapper({ complement: "Andar 5" });
    renderHook(() => useZipCodeAutofill(), { wrapper: Wrapper });

    act(() => {
      getMethods().setValue("zipCode", "01310-100");
    });

    await waitFor(() => expect(fetchAddressByZipCodeMock).toHaveBeenCalled());
    await waitFor(() => {
      expect(getMethods().getValues("street")).toBe("Av. Paulista");
    });

    expect(getMethods().getValues("complement")).toBe("Andar 5");
  });

  it("should set 'cep não encontrado' error when the service returns null", async () => {
    fetchAddressByZipCodeMock.mockResolvedValue(null);
    const { Wrapper, getMethods } = buildWrapper();
    renderHook(() => useZipCodeAutofill(), { wrapper: Wrapper });

    act(() => {
      getMethods().setValue("zipCode", "01310-100");
    });

    await waitFor(() => {
      expect(getMethods().formState.errors.zipCode?.message).toBe("CEP não encontrado.");
    });
  });

  it("should expose hasaddressfetcherror when the lookup fails", async () => {
    fetchAddressByZipCodeMock.mockRejectedValue(new Error("erro"));
    const { Wrapper, getMethods } = buildWrapper();
    const { result } = renderHook(() => useZipCodeAutofill(), { wrapper: Wrapper });

    act(() => {
      getMethods().setValue("zipCode", "01310-100");
    });

    await waitFor(() => expect(result.current.hasAddressFetchError).toBe(true));
  });
});
