"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { deleteVehicle } from "../api/delete-vehicle";

type DeleteVehicleArgs = {
  customerId: string;
  vehicleId: string;
};

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, vehicleId }: DeleteVehicleArgs) =>
      deleteVehicle(customerId, vehicleId),
    onSuccess: (_data, { customerId }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicles(customerId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehiclesAll() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers() });
      toast.success("Veículo removido com sucesso.");
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;

      if (error.statusCode === 404) {
        toast.error("Cliente ou veículo não encontrado.");
        return;
      }

      if (error.statusCode === 400) {
        toast.error(error.message || "Não foi possível remover o veículo.");
        return;
      }

      toast.error("Não foi possível remover o veículo. Tente novamente mais tarde.");
    },
  });
}
