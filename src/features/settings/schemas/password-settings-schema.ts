import { z } from "zod";

import type {
  ConfirmPasswordChangePayload,
  RequestPasswordChangeCodePayload,
} from "@/features/user/types";

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
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "A nova senha deve ser diferente da senha atual.",
    path: ["newPassword"],
  });

export const passwordConfirmationCodeSchema = z.object({
  confirmationCode: z.string().regex(/^\d{6}$/, "Informe o código de 6 dígitos."),
});

export type SetPasswordSettingsFormValues = z.infer<typeof setPasswordSettingsSchema>;
export type ChangePasswordSettingsFormValues = z.infer<typeof changePasswordSettingsSchema>;
export type PasswordSettingsFormValues =
  | SetPasswordSettingsFormValues
  | ChangePasswordSettingsFormValues;
export type PasswordConfirmationCodeFormValues = z.infer<typeof passwordConfirmationCodeSchema>;

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

export function mapPasswordFormToCodeRequestPayload(
  values: PasswordSettingsFormValues,
  hasPassword: boolean,
): RequestPasswordChangeCodePayload {
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

/** @deprecated Use mapPasswordFormToCodeRequestPayload */
export const mapPasswordFormToApiPayload = mapPasswordFormToCodeRequestPayload;

export function buildConfirmPasswordChangePayload(
  pendingPayload: RequestPasswordChangeCodePayload,
  confirmationCode: string,
): ConfirmPasswordChangePayload {
  if ("currentPassword" in pendingPayload) {
    return {
      confirmationCode,
      currentPassword: pendingPayload.currentPassword,
      newPassword: pendingPayload.newPassword,
    };
  }

  return {
    confirmationCode,
    newPassword: pendingPayload.newPassword,
  };
}
