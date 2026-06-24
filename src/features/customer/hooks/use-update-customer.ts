"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { createVehicle } from "@/features/vehicle/api/create-vehicle";
import { updateVehicle } from "@/features/vehicle/api/update-vehicle";

import { updateCustomer } from "../api/update-customer";
import { getCustomerMutationFeedbackError } from "../lib/customer-mutation-feedback";
import {
  mapCustomerFormToUpdatePayload,
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
      await updateCustomer(customerId, mapCustomerFormToUpdatePayload(values));

      const vehiclePayload = mapVehicleFormToPayload(values);

      if (!vehiclePayload) return;

      if (values.vehicle.id) {
        await updateVehicle(customerId, values.vehicle.id, vehiclePayload);
      } else {
        await createVehicle(customerId, vehiclePayload);
      }
    },
    onSuccess: (_, { customerId }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customerOptions() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicles(customerId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicleOptions() });
      toast.success("Cliente atualizado com sucesso.");
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;

      if (error.statusCode === 409) {
        if (error.message.includes("Vehicle already registered")) {
          toast.error("Já existe um veículo com essa placa.");
          return;
        }

        toast.error("Já existe cadastro ativo com esses dados.");
        return;
      }

      if (error.statusCode === 404) {
        toast.error("Cliente ou veículo não encontrado.");
        return;
      }

      const feedback = getCustomerMutationFeedbackError(error, "update");

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
