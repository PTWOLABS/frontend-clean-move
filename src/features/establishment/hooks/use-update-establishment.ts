"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { updateEstablishment } from "../api";
import type { Establishment, UpdateEstablishmentPayload } from "../types";

type UpdateEstablishmentVariables = {
  establishmentId: string;
  payload: UpdateEstablishmentPayload;
};

export function useUpdateEstablishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ establishmentId, payload }: UpdateEstablishmentVariables) =>
      updateEstablishment(establishmentId, payload),
    onSuccess: (establishment, { establishmentId }) => {
      queryClient.setQueryData<Establishment>(
        QUERY_KEYS.establishment(establishmentId),
        establishment,
      );
      toast.success("Configurações salvas com sucesso.");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.statusCode === 409) {
        toast.error("CNPJ já em uso.");
        return;
      }

      const feedback = getMutationFeedbackError(
        "estabelecimento",
        QUERY_KEYS.establishment("")[0],
        error,
        "update",
        {
          forbidden: {
            title: "Você não tem permissão para alterar este estabelecimento.",
            message: "",
          },
          badRequest: {
            title:
              error instanceof ApiError
                ? error.message || "Verifique os dados informados."
                : "Verifique os dados informados.",
            message: "",
          },
        },
      );

      toast.error(feedback.title, {
        id: feedback.id,
        ...(feedback.description ? { description: feedback.description } : {}),
      });
    },
  });
}
