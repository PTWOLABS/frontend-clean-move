/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

const baseItem: ServiceItem = {
  id: "svc-1",
  serviceName: "Lavagem Completa",
  description: "Inclui aspiração",
  category: "WASH",
  estimatedDuration: { minInMinutes: 60, maxInMinutes: 60 },
  price: 6500,
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
  it("optimistically updates service in cached list", async () => {
    updateServiceMock.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 50)),
    );

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const key = QUERY_KEYS.services({ page: 1, size: 5 });
    client.setQueryData(key, initialPage);

    const values = createServiceFormSchema.parse({
      ...serviceItemToFormDefaults(baseItem),
      serviceName: "Lavagem Premium",
    });

    const { result } = renderHook(() => useUpdateService(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({ serviceId: "svc-1", values });

    await waitFor(() => {
      const page = client.getQueryData<ServicesPage>(key);
      expect(page?.items[0]?.serviceName).toBe("Lavagem Premium");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateServiceMock).toHaveBeenCalledWith(
      "svc-1",
      expect.objectContaining({ serviceName: "Lavagem Premium" }),
    );
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

    const values = createServiceFormSchema.parse(serviceItemToFormDefaults(baseItem));

    const { result } = renderHook(() => useUpdateService(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({
      serviceId: "svc-1",
      values: { ...values, serviceName: "Nome temporário" },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData<ServicesPage>(key)).toEqual(initialPage);
    expect(toastErrorMock).toHaveBeenCalledWith("Dados inválidos");
  });
});
