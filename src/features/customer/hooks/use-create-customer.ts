"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { createCustomer } from "../api/create-customer";
import { createVehicle } from "@/features/vehicle/api/create-vehicle";
import {
  mapCustomerFormToPayload,
  mapVehicleFormToPayload,
  type CustomerFormValues,
} from "../schemas/customer-form-schema";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      const customerResponse = await createCustomer(mapCustomerFormToPayload(values));
      const vehiclePayload = mapVehicleFormToPayload(values);

      if (vehiclePayload) {
        await createVehicle(customerResponse.customer.id, vehiclePayload);
      }

      return customerResponse.customer;
    },
    onSuccess: (customer) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicles(customer.id) });
      toast.success("Cliente criado com sucesso.");
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;

      if (error.statusCode === 409) {
        if (error.message.includes("Vehicle already registered")) {
          toast.error("Já existe um veículo com essa placa.");
          return;
        }
        toast.error("Cliente já cadastrado.");
        return;
      }

      const resourceLabel = "o cliente";
      const resourceKey = QUERY_KEYS.customers()[0];

      const feedback = getMutationFeedbackError(resourceLabel, resourceKey, error, "create");

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
