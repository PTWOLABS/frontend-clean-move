import { describe, expect, it } from "vitest";

import {
  customerFormSchema,
  customerToFormDefaults,
  mapCustomerFormToPayload,
  mapCustomerFormToUpdatePayload,
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

  it("passes with only fullName when phone and email are empty", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      phone: "",
      email: "",
    });

    expect(result.success).toBe(true);
  });

  it("treats masked empty phone as optional", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      phone: "(  )     -    ",
      email: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects partially filled phone from mask", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      phone: "123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "phone")?.message;
      expect(message).toBe("Informe um telefone válido (10 ou 11 dígitos).");
    }
  });

  it("rejects invalid email when provided", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      email: "email-invalido",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "email")?.message;
      expect(message).toBe("Informe um e-mail válido.");
    }
  });

  it("accepts formatted CPF with valid check digits", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      cpfCnpj: "390.533.447-05",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cpfCnpj).toBe("39053344705");
    }
  });

  it("accepts formatted CNPJ with valid check digits", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      cpfCnpj: "12.345.678/0001-95",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cpfCnpj).toBe("12345678000195");
    }
  });

  it("rejects CPF/CNPJ with fewer than 11 digits", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      cpfCnpj: "123.456.789",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "cpfCnpj")?.message;
      expect(message).toBe("CPF ou CNPJ incompleto");
    }
  });

  it("rejects incomplete CNPJ with 12 or 13 digits", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      cpfCnpj: "12.345.678/0001-9",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "cpfCnpj")?.message;
      expect(message).toBe("CNPJ incompleto");
    }
  });

  it("rejects CPF with invalid check digits", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      cpfCnpj: "111.111.111-11",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "cpfCnpj")?.message;
      expect(message).toBe("CPF inválido");
    }
  });

  it("rejects CNPJ with invalid check digits", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      cpfCnpj: "12.345.678/0001-90",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "cpfCnpj")?.message;
      expect(message).toBe("CNPJ inválido");
    }
  });

  it("preserves 14-digit CNPJ when mapping customer to form defaults", () => {
    const defaults = customerToFormDefaults({
      id: "cust-1",
      establishmentId: "est-1",
      fullName: "Empresa LTDA",
      phone: null,
      email: null,
      cpfCnpj: "12345678000195",
      nickname: null,
      birthDate: null,
      address: null,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      vehicles: [],
    });

    expect(defaults.cpfCnpj?.replace(/\D/g, "")).toHaveLength(14);
    expect(defaults.cpfCnpj).toBe("12.345.678/0001-95");
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

  it("fails when includeVehicle is true but brand or model are missing", () => {
    const result = customerFormSchema.safeParse({
      ...baseValues,
      includeVehicle: true,
      vehicle: {
        ...baseValues.vehicle,
        brand: "",
        model: "",
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const brandMessage = result.error.issues.find((issue) => issue.path[1] === "brand")?.message;
      const modelMessage = result.error.issues.find((issue) => issue.path[1] === "model")?.message;
      expect(brandMessage).toBe("Informe a marca.");
      expect(modelMessage).toBe("Informe o modelo.");
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

  it("maps empty phone and email as null", () => {
    const payload = mapCustomerFormToPayload({
      ...baseValues,
      phone: "",
      email: "",
    } as never);

    expect(payload.phone).toBeNull();
    expect(payload.email).toBeNull();
  });

  it("includes phone and email when provided", () => {
    const payload = mapCustomerFormToPayload({
      ...baseValues,
      phone: "11999991234",
      email: "joao@email.com",
    } as never);

    expect(payload.phone).toBe("11999991234");
    expect(payload.email).toBe("joao@email.com");
  });
});

describe("mapCustomerFormToUpdatePayload", () => {
  it("omits empty phone and email from update payload", () => {
    const payload = mapCustomerFormToUpdatePayload({
      ...baseValues,
      phone: "",
      email: "",
    } as never);

    expect(payload.phone).toBeUndefined();
    expect(payload.email).toBeUndefined();
    expect(payload.fullName).toBe("João Silva");
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
