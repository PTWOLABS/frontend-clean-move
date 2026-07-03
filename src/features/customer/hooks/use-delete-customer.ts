"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { deleteCustomer } from "../api/delete-customer";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => deleteCustomer(customerId),
    onSuccess: (_, customerId) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customer(customerId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customerOptions() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vehicleOptions() });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.appointments(),
      });
      toast.success("Cliente removido com sucesso.");
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;

      if (error.statusCode === 404) {
        toast.error("Cliente não encontrado.");
        return;
      }

      if (error.statusCode === 400) {
        toast.error(error.message || "Não foi possível remover o cliente.");
        return;
      }

      toast.error("Não foi possível remover o cliente. Tente novamente mais tarde.");
    },
  });
}
