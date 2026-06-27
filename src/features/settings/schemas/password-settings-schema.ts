import { z } from "zod";

import type { UpdateUserPasswordPayload } from "@/features/user/types";

const newPasswordField = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(72, "A senha deve ter no máximo 72 caracteres.");

const confirmPasswordField = z.string().min(1, "Confirme sua nova senha.");

export const setPasswordSettingsSchema = z
  .object({
    newPassword: newPasswordField,
    confirmPassword: confirmPasswordField,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const changePasswordSettingsSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: newPasswordField,
    confirmPassword: confirmPasswordField,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type SetPasswordSettingsFormValues = z.infer<typeof setPasswordSettingsSchema>;
export type ChangePasswordSettingsFormValues = z.infer<typeof changePasswordSettingsSchema>;
export type PasswordSettingsFormValues =
  | SetPasswordSettingsFormValues
  | ChangePasswordSettingsFormValues;

export function createPasswordSettingsSchema(hasPassword: boolean) {
  return hasPassword ? changePasswordSettingsSchema : setPasswordSettingsSchema;
}

export function getPasswordSettingsDefaultValues(hasPassword: boolean) {
  if (hasPassword) {
    return {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    } satisfies ChangePasswordSettingsFormValues;
  }

  return {
    newPassword: "",
    confirmPassword: "",
  } satisfies SetPasswordSettingsFormValues;
}

export function mapPasswordFormToApiPayload(
  values: PasswordSettingsFormValues,
  hasPassword: boolean,
): UpdateUserPasswordPayload {
  const schema = createPasswordSettingsSchema(hasPassword);
  const parsed = schema.parse(values);

  if (hasPassword) {
    const changeValues = parsed as ChangePasswordSettingsFormValues;

    return {
      currentPassword: changeValues.currentPassword,
      newPassword: changeValues.newPassword,
    };
  }

  const setValues = parsed as SetPasswordSettingsFormValues;

  return {
    newPassword: setValues.newPassword,
  };
}
