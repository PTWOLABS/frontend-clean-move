/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import { loginSchema } from "./login-schema";

describe("loginSchema", () => {
  it("should accept a valid payload", () => {
    const result = loginSchema.safeParse({
      email: "fulano@email.com",
      password: "supersenha",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        email: "fulano@email.com",
        password: "supersenha",
      });
    }
  });

  it("should reject an invalid email with a portuguese message", () => {
    const result = loginSchema.safeParse({
      email: "email-invalido",
      password: "supersenha",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "email")?.message;
      expect(message).toBe("Informe um e-mail válido");
    }
  });

  it("should reject passwords longer than 72 characters", () => {
    const result = loginSchema.safeParse({
      email: "fulano@email.com",
      password: "a".repeat(73),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordIssue = result.error.issues.find((issue) => issue.path[0] === "password");
      expect(passwordIssue).toBeDefined();
    }
  });

  it("should reject when the password is not a string", () => {
    const result = loginSchema.safeParse({
      email: "fulano@email.com",
      password: 12345,
    });

    expect(result.success).toBe(false);
  });
});
