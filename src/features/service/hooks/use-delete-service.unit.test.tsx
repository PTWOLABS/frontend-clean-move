/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import type { ServiceItem, ServicesPage } from "../types";

const deleteServiceMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("../api/delete-service", () => ({
  deleteService: (...args: unknown[]) => deleteServiceMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

import { useDeleteService } from "./use-delete-service";

const washCategory = { id: "11cf3860-d512-47db-b9d1-c9044be6250d", name: "Lavagem" };

const itemA: ServiceItem = {
  id: "svc-a",
  serviceName: "Lavagem A",
  category: washCategory,
  priceSpecification: { type: "FIXED", fixedPriceInCents: 3000 },
  isActive: true,
};

const itemB: ServiceItem = {
  id: "svc-b",
  serviceName: "Lavagem B",
  category: washCategory,
  priceSpecification: { type: "FIXED", fixedPriceInCents: 5000 },
  isActive: true,
};

const initialPage: ServicesPage = {
  items: [itemA, itemB],
  total: 2,
  page: 1,
  size: 5,
};

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useDeleteService", () => {
  it("optimistically removes service from cached list", async () => {
    deleteServiceMock.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 50)),
    );

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const key = QUERY_KEYS.services({ page: 1, size: 5 });
    client.setQueryData(key, initialPage);

    const { result } = renderHook(() => useDeleteService(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate("svc-a");

    await waitFor(() => {
      const page = client.getQueryData<ServicesPage>(key);
      expect(page?.items).toHaveLength(1);
      expect(page?.items[0]?.id).toBe("svc-b");
      expect(page?.total).toBe(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleteServiceMock).toHaveBeenCalledWith("svc-a");
  });

  it("restores cache when delete fails", async () => {
    deleteServiceMock.mockRejectedValueOnce(new ApiError({ statusCode: 500, message: "Erro" }));

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const key = QUERY_KEYS.services({ page: 1, size: 5 });
    client.setQueryData(key, initialPage);

    const { result } = renderHook(() => useDeleteService(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate("svc-a");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(client.getQueryData<ServicesPage>(key)).toEqual(initialPage);
    expect(toastErrorMock).toHaveBeenCalled();
  });
});
