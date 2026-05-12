/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import {
  mapRegisterToEstablishmentPayload,
  slugifyTradeName,
} from "./map-register-to-establishment-payload";
import type { RegisterFormValues } from "../schemas/register-schema";

const baseValues: RegisterFormValues = {
  fullName: "João da Silva",
  phone: "(11) 99999-1234",
  email: "joao@email.com",
  password: "senha1234",
  cnpj: "12.345.678/0001-90",
  legalName: "Empresa LTDA",
  tradeName: "Empresa & Cia",
  zipCode: "01310-100",
  street: "Av. Paulista",
  number: "1000",
  city: "São Paulo",
  state: "SP",
  complement: "Sala 1",
};

describe("mapRegisterToEstablishmentPayload", () => {
  it("should map form values to the API payload", () => {
    expect(mapRegisterToEstablishmentPayload(baseValues)).toEqual({
      name: "João da Silva",
      tradeName: "Empresa & Cia",
      legalBusinessName: "Empresa LTDA",
      email: "joao@email.com",
      password: "senha1234",
      cnpj: "12345678000190",
      phone: "11999991234",
      address: {
        street: "Av. Paulista, 1000",
        complement: "Sala 1",
        country: "Brasil",
        state: "SP",
        zipCode: "01310-100",
        city: "São Paulo",
      },
      slug: "empresa-cia",
    });
  });
});

describe("slugifyTradeName", () => {
  it("should return fallback when slug is empty", () => {
    expect(slugifyTradeName("!!!")).toBe("establishment");
  });
});
