"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { Establishment } from "@/features/establishment/types";

import { uploadEstablishmentBanner } from "../api/upload-establishment-banner";

type UploadBannerVariables = {
  establishmentId: string;
  file: File;
};

export function useUploadEstablishmentBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ establishmentId, file }: UploadBannerVariables) =>
      uploadEstablishmentBanner(establishmentId, file),
    onSuccess: (data, { establishmentId }) => {
      queryClient.setQueryData<Establishment | undefined>(
        QUERY_KEYS.establishment(establishmentId),
        (current) => {
          if (!current) return current;

          return {
            ...current,
            bannerImageUrl: data.url,
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.establishment(establishmentId),
      });
      toast.success("Configurações salvas com sucesso.");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 403) {
          toast.error("Você não tem permissão para alterar o banner deste estabelecimento.");
          return;
        }

        if (error.statusCode === 404) {
          toast.error("Estabelecimento não encontrado.");
          return;
        }

        if (error.statusCode === 400) {
          toast.error(error.message || "Arquivo inválido. Use PNG, JPG ou WEBP de até 5 MB.");
          return;
        }
      }

      const feedback = getMutationFeedbackError(
        "banner",
        QUERY_KEYS.establishment("")[0],
        error,
        "update",
      );

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
