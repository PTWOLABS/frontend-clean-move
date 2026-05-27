"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { createCustomerVehicle } from "../api/create-customer-vehicle";
import { updateCustomer } from "../api/update-customer";
import { updateCustomerVehicle } from "../api/update-customer-vehicle";
import {
  mapCustomerFormToPayload,
  mapVehicleFormToPayload,
  type CustomerFormValues,
} from "../schemas/customer-form-schema";

type UpdateCustomerArgs = {
  customerId: string;
  values: CustomerFormValues;
};

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, values }: UpdateCustomerArgs) => {
      await updateCustomer(customerId, mapCustomerFormToPayload(values));

      const vehiclePayload = mapVehicleFormToPayload(values.vehicle);

      if (!vehiclePayload) return;

      if (values.vehicle.id) {
        await updateCustomerVehicle(customerId, values.vehicle.id, vehiclePayload);
      } else {
        await createCustomerVehicle(customerId, vehiclePayload);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customerVehiclesRoot });
      toast.success("Cliente atualizado com sucesso.");
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;

      if (error.statusCode === 409) {
        toast.error("Já existe cadastro ativo com esses dados.");
        return;
      }

      if (error.statusCode === 404) {
        toast.error("Cliente ou veículo não encontrado.");
        return;
      }

      if (error.statusCode === 400) {
        toast.error(error.message || "Verifique os dados informados.");
        return;
      }

      toast.error("Não foi possível atualizar o cliente. Tente novamente mais tarde.");
    },
  });
}
