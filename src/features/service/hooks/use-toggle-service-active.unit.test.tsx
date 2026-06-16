/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ServiceItem } from "../types";

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

import { useToggleServiceActive } from "./use-toggle-service-active";

const washCategory = { id: "11cf3860-d512-47db-b9d1-c9044be6250d", name: "Lavagem" };

const baseItem: ServiceItem = {
  id: "svc-1",
  serviceName: "Lavagem Completa",
  category: washCategory,
  estimatedDuration: { minInMinutes: 60, maxInMinutes: 60 },
  priceSpecification: { type: "FIXED", fixedPriceInCents: 6500 },
  isActive: true,
};

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useToggleServiceActive", () => {
  it("calls updateService with flipped isActive", async () => {
    updateServiceMock.mockResolvedValueOnce({});

    const { result } = renderHook(() => useToggleServiceActive(), { wrapper });

    result.current.mutate(baseItem);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateServiceMock).toHaveBeenCalledWith("svc-1", { isActive: false });
    expect(toastSuccessMock).toHaveBeenCalledWith("Serviço desativado com sucesso.");
  });

  it("activates inactive service", async () => {
    updateServiceMock.mockResolvedValueOnce({});

    const { result } = renderHook(() => useToggleServiceActive(), { wrapper });

    result.current.mutate({ ...baseItem, isActive: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateServiceMock).toHaveBeenCalledWith("svc-1", { isActive: true });
    expect(toastSuccessMock).toHaveBeenCalledWith("Serviço ativado com sucesso.");
  });
});
