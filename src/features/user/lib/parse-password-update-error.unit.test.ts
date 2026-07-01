import { describe, expect, it } from "vitest";

import { parsePasswordUpdateError } from "./parse-password-update-error";

describe("parsePasswordUpdateError", () => {
  it("parses zod validation errors", () => {
    expect(
      parsePasswordUpdateError(400, {
        message: "Validation failed",
        issues: [
          {
            code: "too_small",
            message: "Too small: expected string to have >=8 characters",
            path: "newPassword",
          },
        ],
      }),
    ).toEqual({
      kind: "validation",
      issues: [
        {
          code: "too_small",
          message: "A senha deve ter pelo menos 8 caracteres.",
          path: "newPassword",
        },
      ],
    });
  });

  it("parses invalid current password errors in portuguese", () => {
    expect(
      parsePasswordUpdateError(400, {
        code: "INVALID_CURRENT_PASSWORD",
        field: "currentPassword",
        message: "The current password you entered is incorrect. Check the password and try again.",
      }),
    ).toEqual({
      kind: "wrong_current",
      field: "currentPassword",
      message: "A senha atual informada está incorreta. Verifique e tente novamente.",
    });
  });

  it("parses same as current password errors in portuguese", () => {
    expect(
      parsePasswordUpdateError(400, {
        code: "SAME_AS_CURRENT_PASSWORD",
        field: "newPassword",
        message: "The new password must be different from your current password.",
      }),
    ).toEqual({
      kind: "same_as_current",
      field: "newPassword",
      message: "A nova senha deve ser diferente da sua senha atual.",
    });
  });

  it("parses invalid confirmation code errors in portuguese", () => {
    expect(
      parsePasswordUpdateError(400, {
        code: "INVALID_PASSWORD_CONFIRMATION_CODE",
        field: "confirmationCode",
        message:
          "The confirmation code is invalid or has expired. Request a new code and try again.",
      }),
    ).toEqual({
      kind: "invalid_confirmation_code",
      field: "confirmationCode",
      message:
        "O código de confirmação é inválido ou expirou. Solicite um novo código e tente novamente.",
    });
  });

  it("parses business rule errors in portuguese", () => {
    expect(
      parsePasswordUpdateError(400, {
        message: "Current password is required to update an existing local password.",
      }),
    ).toEqual({
      kind: "business",
      message: "Informe sua senha atual para alterar a senha.",
    });
  });

  it("parses unauthorized and rate limit errors", () => {
    expect(parsePasswordUpdateError(401, { message: "Unauthorized" })).toEqual({
      kind: "unauthorized",
    });
    expect(
      parsePasswordUpdateError(429, { message: "ThrottlerException: Too Many Requests" }),
    ).toEqual({
      kind: "rate_limit",
    });
  });
});
