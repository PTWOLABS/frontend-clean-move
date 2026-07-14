import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import type { ReactNode } from "react";

import { createTestQueryClient } from "@/test/test-utils";
import { QueryClientProvider } from "@tanstack/react-query";

const fetchAddressByZipCodeMock = vi.fn();

vi.mock("@/shared/api/viacep", () => ({
  fetchAddressByZipCode: (...args: unknown[]) => fetchAddressByZipCodeMock(...args),
}));

import { useZipCodeAutofill, type ZipCodeAutofillForm } from "./use-zipcode-autofill";

type NestedAddressFormValues = {
  includeAddress: boolean;
  address: {
    zipCode: string;
    street: string;
    city: string;
    state: string;
    complement: string;
  };
};

const emptyValues: NestedAddressFormValues = {
  includeAddress: true,
  address: {
    zipCode: "",
    street: "",
    city: "",
    state: "",
    complement: "",
  },
};

const nestedAddressFields = {
  zipCode: "address.zipCode",
  street: "address.street",
  city: "address.city",
  state: "address.state",
  complement: "address.complement",
} as const;

function buildWrapper(initialValues: Partial<NestedAddressFormValues> = {}) {
  const client = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    const methods = useForm<NestedAddressFormValues>({
      defaultValues: {
        ...emptyValues,
        ...initialValues,
        address: { ...emptyValues.address, ...initialValues.address },
      },
    });

    return (
      <QueryClientProvider client={client}>
        <FormProvider {...methods}>{children}</FormProvider>
      </QueryClientProvider>
    );
  }

  return { Wrapper };
}

function useTestZipCodeHarness(options?: { enabled?: boolean }) {
  const form = useFormContext<NestedAddressFormValues>();
  const autofill = useZipCodeAutofill(
    form as unknown as ZipCodeAutofillForm,
    nestedAddressFields,
    options,
  );

  return { form, autofill };
}

describe("useZipCodeAutofill", () => {
  beforeEach(() => {
    fetchAddressByZipCodeMock.mockReset();
  });

  it("should not trigger the lookup when the zipcode has fewer than 8 digits", () => {
    const { Wrapper } = buildWrapper({ address: { ...emptyValues.address, zipCode: "1234" } });
    renderHook(() => useTestZipCodeHarness({ enabled: true }), { wrapper: Wrapper });
    expect(fetchAddressByZipCodeMock).not.toHaveBeenCalled();
  });

  it("should not trigger the lookup when enabled is false", async () => {
    const { Wrapper } = buildWrapper();
    const { result } = renderHook(() => useTestZipCodeHarness({ enabled: false }), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.form.setValue("address.zipCode", "01310-100");
    });

    await waitFor(() => {
      expect(fetchAddressByZipCodeMock).not.toHaveBeenCalled();
    });
  });

  it("should fill nested address fields on a successful lookup", async () => {
    fetchAddressByZipCodeMock.mockResolvedValue({
      street: "Av. Paulista",
      city: "São Paulo",
      state: "SP",
      complement: "Sala 1",
    });

    const { Wrapper } = buildWrapper();
    const { result } = renderHook(() => useTestZipCodeHarness({ enabled: true }), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.form.setValue("address.zipCode", "01310-100");
    });

    await waitFor(() => expect(fetchAddressByZipCodeMock).toHaveBeenCalled());
    await waitFor(() => {
      expect(result.current.form.getValues("address.street")).toBe("Av. Paulista");
      expect(result.current.form.getValues("address.city")).toBe("São Paulo");
      expect(result.current.form.getValues("address.state")).toBe("SP");
      expect(result.current.form.getValues("address.complement")).toBe("Sala 1");
    });
  });

  it("should preserve the complement already filled by the user", async () => {
    fetchAddressByZipCodeMock.mockResolvedValue({
      street: "Av. Paulista",
      city: "São Paulo",
      state: "SP",
      complement: "Andar 2",
    });

    const { Wrapper } = buildWrapper({
      address: { ...emptyValues.address, complement: "Andar 5" },
    });
    const { result } = renderHook(() => useTestZipCodeHarness({ enabled: true }), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.form.setValue("address.zipCode", "01310-100");
    });

    await waitFor(() => expect(fetchAddressByZipCodeMock).toHaveBeenCalled());
    await waitFor(() => {
      expect(result.current.form.getValues("address.street")).toBe("Av. Paulista");
    });

    expect(result.current.form.getValues("address.complement")).toBe("Andar 5");
  });

  it("should preserve persisted address fields without calling viacep when hydrated", async () => {
    fetchAddressByZipCodeMock.mockResolvedValue({
      street: "Avenida Paulista",
      city: "São Paulo",
      state: "SP",
      complement: "",
    });

    const { Wrapper } = buildWrapper({
      address: {
        ...emptyValues.address,
        zipCode: "01310-100",
        street: "Av. Paulista, 100",
        city: "São Paulo",
        state: "SP",
      },
    });
    const { result } = renderHook(() => useTestZipCodeHarness({ enabled: true }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.form.getValues("address.street")).toBe("Av. Paulista, 100");
    });

    expect(fetchAddressByZipCodeMock).not.toHaveBeenCalled();
    expect(result.current.form.getValues("address.city")).toBe("São Paulo");
    expect(result.current.form.getValues("address.state")).toBe("SP");
  });

  it("should apply autofill when the user changes from one zipcode to another", async () => {
    fetchAddressByZipCodeMock.mockResolvedValue({
      street: "Av. Brigadeiro Faria Lima",
      city: "São Paulo",
      state: "SP",
      complement: "",
    });

    const { Wrapper } = buildWrapper({
      address: {
        ...emptyValues.address,
        zipCode: "01310-100",
        street: "Av. Paulista, 100",
        city: "São Paulo",
        state: "SP",
      },
    });
    const { result } = renderHook(() => useTestZipCodeHarness({ enabled: true }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(fetchAddressByZipCodeMock).not.toHaveBeenCalled();
    });

    fetchAddressByZipCodeMock.mockResolvedValue({
      street: "Av. Brigadeiro Faria Lima",
      city: "São Paulo",
      state: "SP",
      complement: "",
    });

    act(() => {
      result.current.form.setValue("address.zipCode", "04538-133");
    });

    await waitFor(() => expect(fetchAddressByZipCodeMock).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      expect(result.current.form.getValues("address.street")).toBe("Av. Brigadeiro Faria Lima");
      expect(result.current.form.getValues("address.city")).toBe("São Paulo");
      expect(result.current.form.getValues("address.state")).toBe("SP");
    });
  });

  it("should allow manual fill when the service returns null", async () => {
    fetchAddressByZipCodeMock.mockResolvedValue(null);
    const { Wrapper } = buildWrapper();
    const { result } = renderHook(() => useTestZipCodeHarness({ enabled: true }), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.form.setValue("address.zipCode", "01310-100");
    });

    await waitFor(() => expect(result.current.autofill.zipCodeNotFound).toBe(true));

    expect(result.current.form.formState.errors.address?.zipCode).toBeUndefined();
    expect(result.current.autofill.hasAddressFetchError).toBe(false);
  });

  it("should expose hasAddressFetchError when the lookup fails", async () => {
    fetchAddressByZipCodeMock.mockRejectedValue(new Error("erro"));
    const { Wrapper } = buildWrapper();
    const { result } = renderHook(() => useTestZipCodeHarness({ enabled: true }), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.form.setValue("address.zipCode", "01310-100");
    });

    await waitFor(() => expect(result.current.autofill.hasAddressFetchError).toBe(true));
  });

  it("should refill address when street/city/state are cleared for the same zipcode", async () => {
    fetchAddressByZipCodeMock.mockResolvedValue({
      street: "Av. Paulista",
      city: "São Paulo",
      state: "SP",
      complement: "",
    });

    const { Wrapper } = buildWrapper();
    const { result } = renderHook(() => useTestZipCodeHarness({ enabled: true }), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.form.setValue("address.zipCode", "01310-100");
    });

    await waitFor(() => expect(fetchAddressByZipCodeMock).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      expect(result.current.form.getValues("address.street")).toBe("Av. Paulista");
    });

    act(() => {
      result.current.form.setValue("address.street", "");
      result.current.form.setValue("address.city", "");
      result.current.form.setValue("address.state", "");
    });

    // Cached ViaCEP result is reapplied without requiring a second network call.
    await waitFor(() => {
      expect(result.current.form.getValues("address.street")).toBe("Av. Paulista");
      expect(result.current.form.getValues("address.city")).toBe("São Paulo");
      expect(result.current.form.getValues("address.state")).toBe("SP");
    });
  });
});
