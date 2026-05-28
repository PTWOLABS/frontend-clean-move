"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { createCustomer } from "../api/create-customer";
import { createCustomerVehicle } from "../api/create-customer-vehicle";
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

      if (vehiclePayload) {
        await createCustomerVehicle(customerResponse.customer.id, vehiclePayload);
      }

      return customerResponse.customer;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers() });
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

      if (error.statusCode === 404) {
        toast.error("Estabelecimento ou cliente não encontrado.");
        return;
      }

      if (error.statusCode === 400) {
        toast.error(error.message || "Verifique os dados informados.");
        return;
      }

      toast.error("Não foi possível cadastrar o cliente. Tente novamente mais tarde.");
    },
  });
}
