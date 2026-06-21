import { describe, expect, it } from "vitest";

import {
  CNPJ_MASK,
  CPF_MASK,
  cpfCnpjMaskModify,
  DATE_MASK,
  getCpfCnpjMask,
  PHONE_MASK,
  ZIP_CODE_MASK,
} from "./input-masks";

describe("input-masks", () => {
  it("should expose stable mask constants", () => {
    expect(PHONE_MASK).toBe("(__) _____-____");
    expect(CPF_MASK).toBe("___.___.___-__");
    expect(CNPJ_MASK).toBe("__.___.___/____-__");
    expect(ZIP_CODE_MASK).toBe("_____-___");
    expect(DATE_MASK).toBe("__/__/____");
  });

  it("should use CPF mask for up to 11 digits", () => {
    expect(getCpfCnpjMask("")).toBe(CPF_MASK);
    expect(getCpfCnpjMask("123.456.789-0")).toBe(CPF_MASK);
    expect(getCpfCnpjMask("12345678901")).toBe(CPF_MASK);
  });

  it("should switch to CNPJ mask after 11 digits", () => {
    expect(getCpfCnpjMask("123456789012")).toBe(CNPJ_MASK);
    expect(getCpfCnpjMask("12.345.678/0001-90")).toBe(CNPJ_MASK);
  });

  it("cpfCnpjMaskModify should keep CPF mask for up to 11 digits", () => {
    expect(cpfCnpjMaskModify({ value: "123.456.789-01" } as never)).toEqual({ mask: CPF_MASK });
  });

  it("cpfCnpjMaskModify should switch to CNPJ mask when inserting the 12th digit", () => {
    expect(
      cpfCnpjMaskModify({
        value: "123.456.789-01",
        data: "2",
        selectionStart: 14,
        selectionEnd: 14,
      } as never),
    ).toEqual({ mask: CNPJ_MASK });
  });

  it("cpfCnpjMaskModify should switch to CNPJ mask after 11 digits", () => {
    expect(cpfCnpjMaskModify({ value: "12.345.678/0001-90" } as never)).toEqual({
      mask: CNPJ_MASK,
    });
  });
});
