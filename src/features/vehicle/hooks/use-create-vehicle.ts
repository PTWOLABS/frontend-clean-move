"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { createVehicle } from "../api/create-vehicle";
import { mapVehicleFormToPayload, type VehicleFormValues } from "../schemas/vehicle-form-schema";

type CreateVehicleArgs = {
  customerId: string;
  values: VehicleFormValues;
};

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, values }: CreateVehicleArgs) => {
      const payload = mapVehicleFormToPayload(values);
      if (!payload) {
        throw new Error("Informe pelo menos um dado do veículo.");
      }
      const response = await createVehicle(customerId, payload);
      return response.vehicle;
    },
    onSuccess: (_data, { customerId }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicles(customerId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehiclesAll() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicleOptions() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers() });
      toast.success("Veículo criado com sucesso.");
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;

      if (error.statusCode === 409) {
        toast.error("Já existe um veículo com essa placa.");
        return;
      }

      if (error.statusCode === 404) {
        toast.error("Cliente não encontrado.");
        return;
      }

      if (error.statusCode === 400) {
        toast.error(error.message || "Verifique os dados informados.");
        return;
      }

      toast.error("Não foi possível criar o veículo. Tente novamente mais tarde.");
    },
  });
}
