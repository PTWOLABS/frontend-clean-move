/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import { resetPasswordSchema } from "./reset-password-schema";

describe("resetPasswordSchema", () => {
  it("should accept matching passwords with at least 8 characters", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "senhaForte",
      confirmPassword: "senhaForte",
    });

    expect(result.success).toBe(true);
  });

  it("should reject passwords shorter than 8 characters", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "curta",
      confirmPassword: "curta",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "newPassword")?.message;
      expect(message).toBe("A senha deve ter pelo menos 8 caracteres.");
    }
  });

  it("should reject when passwords do not match", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "senhaForte",
      confirmPassword: "outraSenha",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "confirmPassword")
        ?.message;
      expect(message).toBe("As senhas não coincidem.");
    }
  });

  it("should reject passwords longer than 72 characters", () => {
    const longPassword = "a".repeat(73);

    const result = resetPasswordSchema.safeParse({
      newPassword: longPassword,
      confirmPassword: longPassword,
    });

    expect(result.success).toBe(false);
  });
});
