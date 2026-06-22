"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { createVehicle } from "@/features/vehicle/api/create-vehicle";
import { createCustomer } from "../api/create-customer";
import {
  CustomerPartialCreationError,
  isCustomerPartialCreationError,
} from "../lib/customer-partial-creation-error";
import {
  getCustomerMutationFeedbackError,
  getVehicleCreationErrorMessage,
} from "../lib/customer-mutation-feedback";
import {
  mapCustomerFormToPayload,
  mapVehicleFormToPayload,
  type CustomerFormValues,
} from "../schemas/customer-form-schema";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      const customerResponse = await createCustomer(mapCustomerFormToPayload(values));
      const vehiclePayload = mapVehicleFormToPayload(values);

      if (!vehiclePayload) {
        return customerResponse.customer;
      }

      try {
        await createVehicle(customerResponse.customer.id, vehiclePayload);
      } catch (error) {
        if (error instanceof ApiError) {
          throw new CustomerPartialCreationError(customerResponse.customer, error);
        }

        throw error;
      }

      return customerResponse.customer;
    },
    onSuccess: (customer) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customerOptions() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicles(customer.id) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicleOptions() });
      toast.success("Cliente criado com sucesso.");
    },
    onError: (error) => {
      if (isCustomerPartialCreationError(error)) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers() });
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.vehicles(error.customer.id),
        });

        toast.warning("Cliente salvo, mas o veículo não foi cadastrado.", {
          description: getVehicleCreationErrorMessage(error.apiError),
        });
        return;
      }

      if (!(error instanceof ApiError)) return;

      if (error.statusCode === 409) {
        toast.error("Cliente já cadastrado.");
        return;
      }

      const feedback = getCustomerMutationFeedbackError(error, "create");

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
