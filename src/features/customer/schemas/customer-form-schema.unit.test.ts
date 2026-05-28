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
