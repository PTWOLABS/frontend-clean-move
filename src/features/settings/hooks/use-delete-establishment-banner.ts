"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Establishment } from "@/features/establishment/types";
import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";

import { deleteEstablishmentBanner } from "../api/delete-establishment-banner";

type DeleteBannerVariables = {
  establishmentId: string;
};

export function useDeleteEstablishmentBanner() {
  const queryClient = useQueryClient();

  const syncBannerImageRemoved = (establishmentId: string) => {
    queryClient.setQueryData<Establishment | undefined>(
      QUERY_KEYS.establishment(establishmentId),
      (current) => {
        if (!current) return current;

        return {
          ...current,
          bannerImageUrl: null,
        };
      },
    );

    void queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.establishment(establishmentId),
    });
  };

  return useMutation({
    mutationFn: ({ establishmentId }: DeleteBannerVariables) =>
      deleteEstablishmentBanner(establishmentId),
    onSuccess: (_data, { establishmentId }) => {
      syncBannerImageRemoved(establishmentId);
      toast.success("Banner removido com sucesso.");
    },
    onError: (error, { establishmentId }) => {
      if (error instanceof ApiError && error.statusCode === 404) {
        syncBannerImageRemoved(establishmentId);
        toast.success("Banner removido com sucesso.");
        return;
      }

      const feedback = getMutationFeedbackError(
        "banner",
        QUERY_KEYS.establishment("")[0],
        error,
        "delete",
        {
          forbidden: {
            title: "Você não tem permissão para alterar o banner deste estabelecimento.",
            message: "",
          },
          badRequest: {
            title:
              error instanceof ApiError
                ? error.message || "Não foi possível remover o banner."
                : "Não foi possível remover o banner.",
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
