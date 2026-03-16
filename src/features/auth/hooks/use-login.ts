import { useMutation } from "@tanstack/react-query";

import { login } from "../api";
import type { LoginFormValues } from "../schemas/login-schema";

export function useLogin() {
  return useMutation({
    mutationFn: (values: LoginFormValues) => login(values),
  });
}

