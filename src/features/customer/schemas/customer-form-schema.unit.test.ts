import { describe, expect, it } from "vitest";

import {
  customerFormSchema,
  mapCustomerFormToPayload,
  mapVehicleFormToPayload,
} from "./customer-form-schema";

const baseValues = {
  fullName: "João Silva",
  phone: "11999991234",
  email: "joao@email.com",
  cpfCnpj: "",
  nickname: "",
  birthDate: "",
  includeAddress: false,
  includeVehicle: false,
  address: {
    street: "Rua A",
    complement: "",
    country: "Brasil",
    state: "SP",
    zipCode: "01001000",
    city: "São Paulo",
  },
  vehicle: {
    id: undefined,
    plate: "ABC1234",
    brand: "Fiat",
    model: "Uno",
    color: "Preto",
    year: 2020,
    notes: "",
  },
};

describe("customerFormSchema", () => {
  it("fails when includeAddress is true but required fields are missing", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      includeAddress: true,
      address: {
        street: "",
        complement: "",
        country: "",
        state: "",
        zipCode: "",
        city: "",
      },
    });

    expect(result.success).toBe(false);
  });

  it("passes when includeAddress and includeVehicle are false", () => {
    const result = customerFormSchema.safeParse(baseValues);
    expect(result.success).toBe(true);
  });

  it("accepts formatted CPF with 11 digits", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      cpfCnpj: "123.456.789-01",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cpfCnpj).toBe("12345678901");
    }
  });

  it("accepts formatted CNPJ with 14 digits", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      cpfCnpj: "12.345.678/0001-90",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cpfCnpj).toBe("12345678000190");
    }
  });

  it("rejects CPF/CNPJ with invalid digit count", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      cpfCnpj: "123.456.789",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "cpfCnpj")?.message;
      expect(message).toBe("Informe um CPF ou CNPJ válido.");
    }
  });

  it("accepts birthDate in dd/MM/yyyy and normalizes to ISO", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      birthDate: "15/01/1990",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.birthDate).toBe("1990-01-15");
    }
  });

  it("rejects invalid birthDate", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      birthDate: "31/02/2000",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "birthDate")?.message;
      expect(message).toBe("Informe uma data de nascimento válida.");
    }
  });

  it("fails when includeAddress is true and zipCode format is invalid", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      includeAddress: true,
      address: {
        ...baseValues.address,
        zipCode: "1234",
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[1] === "zipCode")?.message;
      expect(message).toBe("Informe um CEP válido.");
    }
  });
});

describe("mapCustomerFormToPayload", () => {
  it("forces address null when includeAddress is false", () => {
    const payload = mapCustomerFormToPayload({
      ...baseValues,
      includeAddress: false,
    } as never);

    expect(payload.address).toBeNull();
  });

  it("maps address when includeAddress is true and fields are complete", () => {
    const payload = mapCustomerFormToPayload({
      ...baseValues,
      includeAddress: true,
    } as never);

    expect(payload.address).toEqual({
      street: "Rua A",
      city: "São Paulo",
      state: "SP",
      zipCode: "01001000",
      country: "Brasil",
    });
  });
});

describe("mapVehicleFormToPayload", () => {
  it("returns null when includeVehicle is false", () => {
    expect(mapVehicleFormToPayload({ ...baseValues, includeVehicle: false } as never)).toBeNull();
  });

  it("returns payload when includeVehicle is true and vehicle has data", () => {
    const payload = mapVehicleFormToPayload({ ...baseValues, includeVehicle: true } as never);

    expect(payload).toEqual({
      plate: "ABC1234",
      brand: "Fiat",
      model: "Uno",
      color: "Preto",
      year: 2020,
      notes: undefined,
    });
  });
});
