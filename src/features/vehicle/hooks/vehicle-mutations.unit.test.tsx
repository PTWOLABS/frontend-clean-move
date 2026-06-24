/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import type { VehicleFormValues } from "../schemas/vehicle-form-schema";
import type { VehicleDto } from "../types";

const deleteVehicleMock = vi.hoisted(() => vi.fn());
const updateVehicleMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());

vi.mock("../api/delete-vehicle", () => ({
  deleteVehicle: (...args: unknown[]) => deleteVehicleMock(...args),
}));

vi.mock("../api/update-vehicle", () => ({
  updateVehicle: (...args: unknown[]) => updateVehicleMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

import { useDeleteVehicle } from "./use-delete-vehicle";
import { useUpdateVehicle } from "./use-update-vehicle";

const vehicle: VehicleDto = {
  id: "vehicle-1",
  establishmentId: "establishment-1",
  customerId: "customer-1",
  plate: "ABC1234",
  brand: "Honda",
  model: "Civic",
  color: "Prata",
  year: 2020,
  notes: null,
  createdAt: "2026-05-01T09:00:00.000Z",
  updatedAt: "2026-05-01T09:00:00.000Z",
};

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("vehicle mutation hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates appointments after updating a vehicle", async () => {
    const client = createQueryClient();
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");
    const values: VehicleFormValues = {
      plate: "abc1234",
      brand: "Honda",
      model: "Civic",
      color: "",
      year: 2020,
      notes: "",
    };

    updateVehicleMock.mockResolvedValueOnce({ vehicle });

    const { result } = renderHook(() => useUpdateVehicle(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({
      customerId: "customer-1",
      vehicleId: "vehicle-1",
      values,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateVehicleMock).toHaveBeenCalledWith(
      "customer-1",
      "vehicle-1",
      expect.objectContaining({
        plate: "ABC1234",
        brand: "Honda",
        model: "Civic",
        year: 2020,
      }),
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.vehicles("customer-1"),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.vehiclesAll() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.vehicleOptions() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.customers() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.appointments() });
  });

  it("invalidates appointments after deleting a vehicle", async () => {
    const client = createQueryClient();
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");

    deleteVehicleMock.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useDeleteVehicle(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({
      customerId: "customer-1",
      vehicleId: "vehicle-1",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(deleteVehicleMock).toHaveBeenCalledWith("customer-1", "vehicle-1");
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.vehicles("customer-1"),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.vehiclesAll() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.vehicleOptions() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.customers() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.appointments() });
  });
});
