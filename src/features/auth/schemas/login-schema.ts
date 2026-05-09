import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string("Informe uma senha válida.").max(72),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
