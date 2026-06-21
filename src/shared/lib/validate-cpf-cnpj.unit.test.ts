import { describe, expect, it } from "vitest";

import { isValidCnpj, isValidCpf, isValidCpfCnpj } from "./validate-cpf-cnpj";

describe("isValidCpf", () => {
  it("accepts a valid CPF", () => {
    expect(isValidCpf("390.533.447-05")).toBe(true);
  });

  it("rejects CPF with invalid check digits", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("123.456.789-01")).toBe(false);
  });
});

describe("isValidCnpj", () => {
  it("accepts a valid CNPJ", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("12.345.678/0001-95")).toBe(true);
  });

  it("rejects CNPJ with invalid check digits", () => {
    expect(isValidCnpj("12.345.678/0001-90")).toBe(false);
  });
});

describe("isValidCpfCnpj", () => {
  it("validates CPF and CNPJ by length", () => {
    expect(isValidCpfCnpj("39053344705")).toBe(true);
    expect(isValidCpfCnpj("11222333000181")).toBe(true);
    expect(isValidCpfCnpj("123456789")).toBe(false);
  });
});
