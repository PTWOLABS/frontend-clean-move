import { describe, expect, it } from "vitest";

import { mapVehicleFormToPayload, vehicleFormSchema } from "./vehicle-form-schema";

describe("vehicleFormSchema", () => {
  it("rejects plate with invalid length when provided", () => {
    const result = vehicleFormSchema.safeParse({
      plate: "ABC12",
      brand: "",
      model: "",
      color: "",
      year: undefined,
      notes: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects year below 1900", () => {
    const result = vehicleFormSchema.safeParse({
      plate: "",
      brand: "Fiat",
      model: "Uno",
      color: "",
      year: 1899,
      notes: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid vehicle data", () => {
    const result = vehicleFormSchema.safeParse({
      plate: "abc1234",
      brand: "Fiat",
      model: "Uno",
      color: "Preto",
      year: 2020,
      notes: "",
    });

    expect(result.success).toBe(true);
  });
});

describe("mapVehicleFormToPayload", () => {
  it("normalizes plate to uppercase without separators", () => {
    const payload = mapVehicleFormToPayload({
      plate: "abc-1234",
      brand: "Fiat",
      model: "",
      color: "",
      year: undefined,
      notes: "",
    });

    expect(payload?.plate).toBe("ABC1234");
  });

  it("returns null when all fields are empty", () => {
    const payload = mapVehicleFormToPayload({
      plate: "",
      brand: "",
      model: "",
      color: "",
      year: undefined,
      notes: "",
    });

    expect(payload).toBeNull();
  });
});
