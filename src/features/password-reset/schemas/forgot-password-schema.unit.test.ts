/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import { forgotPasswordSchema } from "./forgot-password-schema";

describe("forgotPasswordSchema", () => {
  it("should accept a valid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "user@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid email with a portuguese message", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "email-invalido",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "email")?.message;
      expect(message).toBe("Informe um e-mail válido");
    }
  });
});
