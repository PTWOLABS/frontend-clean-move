"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";

import { deleteService } from "../api/delete-service";

export function useDeleteService(ownerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: string) => deleteService(serviceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["establishments", ownerId, "services"],
      });
      toast.success("Serviço eliminado com sucesso.");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 400) {
          toast.error(error.message || "Não foi possível eliminar. Tente novamente.");
          return;
        }
        if (error.statusCode === 404) {
          toast.error("Serviço não encontrado.");
          return;
        }
        toast.error("Não foi possível eliminar o serviço. Tente novamente mais tarde.");
      }
    },
  });
}
