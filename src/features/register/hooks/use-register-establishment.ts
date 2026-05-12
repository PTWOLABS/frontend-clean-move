import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { ApiError } from "@/shared/api/httpClient";

import { registerEstablishment } from "../api/establishment";
import { mapRegisterToEstablishmentPayload } from "../lib/map-register-to-establishment-payload";
import type { RegisterFormValues } from "../schemas/register-schema";

export function useRegisterEstablishment() {
  const router = useRouter();

  return useMutation({
    mutationFn: (values: RegisterFormValues) =>
      registerEstablishment(mapRegisterToEstablishmentPayload(values)),
    mutationKey: QUERY_KEYS.registerEstablishment,
    onSuccess: () => {
      toast.success("Cadastro concluído. Faça login para continuar.");
      router.push("/login");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 400) {
          return toast.error(
            error.message || "Não foi possível concluir o cadastro. Verifique os dados.",
          );
        }
        toast.error("Não foi possível concluir o cadastro. Tente novamente mais tarde.");
      }
    },
  });
}
