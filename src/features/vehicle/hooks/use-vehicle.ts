"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { getVehicleById } from "../api/get-vehicle-by-id";

type UseVehicleArgs = {
  customerId?: string | null;
  vehicleId?: string | null;
  enabled?: boolean;
};

export function useVehicle({ customerId, vehicleId, enabled = true }: UseVehicleArgs) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicle(customerId ?? undefined, vehicleId ?? undefined),
    queryFn: ({ signal }) => {
      if (!customerId || !vehicleId) {
        throw new Error("Customer id and vehicle id are required.");
      }

      return getVehicleById(customerId, vehicleId, signal);
    },
    enabled: enabled && Boolean(customerId) && Boolean(vehicleId),
  });
}
