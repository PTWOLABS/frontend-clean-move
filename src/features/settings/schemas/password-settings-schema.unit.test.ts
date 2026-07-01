import { describe, expect, it } from "vitest";

import {
  buildConfirmPasswordChangePayload,
  changePasswordSettingsSchema,
  mapPasswordFormToCodeRequestPayload,
  passwordConfirmationCodeSchema,
  setPasswordSettingsSchema,
} from "./password-settings-schema";

describe("password settings schema", () => {
  it("maps set-password form values to code request payload", () => {
    const values = setPasswordSettingsSchema.parse({
      newPassword: "novaSenha123",
      confirmPassword: "novaSenha123",
    });

    expect(mapPasswordFormToCodeRequestPayload(values, false)).toEqual({
      newPassword: "novaSenha123",
    });
  });

  it("maps change-password form values to code request payload", () => {
    const values = changePasswordSettingsSchema.parse({
      currentPassword: "senhaAtual123",
      newPassword: "novaSenha123",
      confirmPassword: "novaSenha123",
    });

    expect(mapPasswordFormToCodeRequestPayload(values, true)).toEqual({
      currentPassword: "senhaAtual123",
      newPassword: "novaSenha123",
    });
  });

  it("rejects when new password equals current password", () => {
    const result = changePasswordSettingsSchema.safeParse({
      currentPassword: "mesmaSenha123",
      newPassword: "mesmaSenha123",
      confirmPassword: "mesmaSenha123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "A nova senha deve ser diferente da senha atual.",
      );
    }
  });

  it("builds confirm password change payload with confirmation code", () => {
    expect(
      buildConfirmPasswordChangePayload(
        {
          currentPassword: "senhaAtual123",
          newPassword: "novaSenha123",
        },
        "123456",
      ),
    ).toEqual({
      confirmationCode: "123456",
      currentPassword: "senhaAtual123",
      newPassword: "novaSenha123",
    });

    expect(
      buildConfirmPasswordChangePayload(
        {
          newPassword: "novaSenha123",
        },
        "123456",
      ),
    ).toEqual({
      confirmationCode: "123456",
      newPassword: "novaSenha123",
    });
  });

  it("validates confirmation code with exactly 6 digits", () => {
    expect(passwordConfirmationCodeSchema.safeParse({ confirmationCode: "123456" }).success).toBe(
      true,
    );
    expect(passwordConfirmationCodeSchema.safeParse({ confirmationCode: "12ab56" }).success).toBe(
      false,
    );
  });
});
