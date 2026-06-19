/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import {
  createServiceFormSchema,
  serviceItemToFormDefaults,
} from "../schemas/create-service-schema";
import type { ServiceItem, ServicesPage } from "../types";

const updateServiceMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("../api/update-service", () => ({
  updateService: (...args: unknown[]) => updateServiceMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

import { useUpdateService } from "./use-update-service";

const washCategory = { id: "11cf3860-d512-47db-b9d1-c9044be6250d", name: "Lavagem" };

const baseItem: ServiceItem = {
  id: "svc-1",
  serviceName: "Lavagem Completa",
  description: "Inclui aspiração",
  category: washCategory,
  estimatedDuration: { minInMinutes: 60, maxInMinutes: 60 },
  priceSpecification: { type: "FIXED", fixedPriceInCents: 6500 },
  isActive: true,
};

const initialPage: ServicesPage = {
  items: [baseItem],
  total: 1,
  page: 1,
  size: 5,
};

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useUpdateService", () => {
  beforeEach(() => {
    updateServiceMock.mockReset();
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  it("optimistically updates service in cached list without invalidating appointments when price did not change", async () => {
    updateServiceMock.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 50)),
    );

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const key = QUERY_KEYS.services({ page: 1, size: 5 });
    client.setQueryData(key, initialPage);
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");

    const values = createServiceFormSchema.parse({
      ...serviceItemToFormDefaults(baseItem),
      serviceName: "Lavagem Premium",
    });

    const { result } = renderHook(() => useUpdateService(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({ serviceId: "svc-1", values, previousService: baseItem });

    await waitFor(() => {
      const page = client.getQueryData<ServicesPage>(key);
      expect(page?.items[0]?.serviceName).toBe("Lavagem Premium");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({ queryKey: QUERY_KEYS.appointments() });
    expect(updateServiceMock).toHaveBeenCalledWith(
      "svc-1",
      expect.objectContaining({ serviceName: "Lavagem Premium" }),
    );
  });

  it("invalidates appointments when the service price changes", async () => {
    updateServiceMock.mockResolvedValueOnce({});

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const key = QUERY_KEYS.services({ page: 1, size: 5 });
    client.setQueryData(key, initialPage);
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");

    const values = createServiceFormSchema.parse({
      ...serviceItemToFormDefaults(baseItem),
      fixedPriceInReais: "80,00",
    });

    const { result } = renderHook(() => useUpdateService(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({ serviceId: "svc-1", values, previousService: baseItem });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.appointments() });
  });

  it("invalidates appointments when the service price modality changes", async () => {
    updateServiceMock.mockResolvedValueOnce({});

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const key = QUERY_KEYS.services({ page: 1, size: 5 });
    client.setQueryData(key, initialPage);
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");

    const values = createServiceFormSchema.parse({
      ...serviceItemToFormDefaults(baseItem),
      priceType: "STARTING_AT",
      fixedPriceInReais: "",
      minPriceInReais: "65,00",
    });

    const { result } = renderHook(() => useUpdateService(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({ serviceId: "svc-1", values, previousService: baseItem });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.appointments() });
  });

  it("restores cache when update fails", async () => {
    updateServiceMock.mockRejectedValueOnce(
      new ApiError({ statusCode: 400, message: "Dados inválidos" }),
    );

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const key = QUERY_KEYS.services({ page: 1, size: 5 });
    client.setQueryData(key, initialPage);
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");

    const values = createServiceFormSchema.parse(serviceItemToFormDefaults(baseItem));

    const { result } = renderHook(() => useUpdateService(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({
      serviceId: "svc-1",
      values: { ...values, serviceName: "Nome temporário" },
      previousService: baseItem,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData<ServicesPage>(key)).toEqual(initialPage);
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.appointments(),
    });
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Não foi possível atualizar o serviço.",
      expect.objectContaining({
        description: "Verifique se os dados enviados estão corretos.",
      }),
    );
  });
});
