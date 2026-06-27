import { describe, expect, it } from "vitest";

import {
  mapPasswordFormToApiPayload,
  setPasswordSettingsSchema,
} from "./password-settings-schema";

describe("mapPasswordFormToApiPayload", () => {
  it("maps set-password form values to API payload", () => {
    const values = setPasswordSettingsSchema.parse({
      newPassword: "novaSenha123",
      confirmPassword: "novaSenha123",
    });

    expect(mapPasswordFormToApiPayload(values, false)).toEqual({
      newPassword: "novaSenha123",
    });
  });

  it("maps change-password form values to API payload", () => {
    const values = {
      currentPassword: "senhaAtual123",
      newPassword: "novaSenha123",
      confirmPassword: "novaSenha123",
    };

    expect(mapPasswordFormToApiPayload(values, true)).toEqual({
      currentPassword: "senhaAtual123",
      newPassword: "novaSenha123",
    });
  });
});
