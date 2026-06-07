"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { User } from "@/features/user/types";

import { uploadUserProfileImage } from "../api/upload-user-profile-image";

export function useUploadUserProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadUserProfileImage(file),
    onSuccess: (data) => {
      queryClient.setQueryData<User | undefined>(QUERY_KEYS.userMe(), (current) => {
        if (!current) return current;

        return {
          ...current,
          profileImageUrl: data.url,
        };
      });

      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userMe() });
      toast.success("Configurações salvas com sucesso.");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 400) {
          toast.error(error.message || "Arquivo inválido. Use PNG, JPG ou WEBP de até 5 MB.");
          return;
        }
      }

      const feedback = getMutationFeedbackError(
        "foto de perfil",
        QUERY_KEYS.userMe()[0],
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
