import { describe, expect, it } from "vitest";

import {
  onboardingCompanyStepSchema,
  onboardingCustomerVehicleStepSchema,
  onboardingSchema,
  onboardingServiceStepSchema,
} from "./onboarding-schema";

describe("onboardingCompanyStepSchema", () => {
  it("allows all company fields to be empty", () => {
    const result = onboardingCompanyStepSchema.safeParse({
      cnpj: "",
      legalName: "",
      tradeName: "",
    });

    expect(result.success).toBe(true);
  });
});

describe("onboardingServiceStepSchema", () => {
  it("allows the service step to be empty", () => {
    const result = onboardingServiceStepSchema.safeParse({
      name: "",
      description: "",
      category: "",
      minDurationInMinutes: "",
      maxDurationInMinutes: "",
      price: "",
      isActive: false,
    });

    expect(result.success).toBe(true);
  });

  it("requires service core fields when any service field is filled", () => {
    const result = onboardingServiceStepSchema.safeParse({
      name: "",
      description: "Lavagem externa simples.",
      category: undefined,
      minDurationInMinutes: "",
      maxDurationInMinutes: "",
      price: "",
      isActive: false,
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["name"] }),
        expect.objectContaining({ path: ["category"] }),
        expect.objectContaining({ path: ["minDurationInMinutes"] }),
        expect.objectContaining({ path: ["price"] }),
      ]),
    );
  });

  it("allows a filled service when required fields are valid", () => {
    const result = onboardingServiceStepSchema.safeParse({
      name: "Lavagem premium",
      description: "",
      category: "WASH",
      minDurationInMinutes: "30",
      maxDurationInMinutes: "",
      price: "120,00",
      isActive: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects max duration smaller than min duration", () => {
    const result = onboardingServiceStepSchema.safeParse({
      name: "Lavagem premium",
      description: "",
      category: "WASH",
      minDurationInMinutes: "60",
      maxDurationInMinutes: "30",
      price: "120,00",
      isActive: true,
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["maxDurationInMinutes"] })]),
    );
  });
});

describe("onboardingCustomerVehicleStepSchema", () => {
  const emptyCustomerVehicleStepValues = {
    customerFullName: "",
    customerPhone: "",
    customerEmail: "",
    vehiclePlate: "",
    vehicleModel: "",
    vehicleColor: "",
  };

  it("allows the customer and vehicle step to be empty", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse(emptyCustomerVehicleStepValues);

    expect(result.success).toBe(true);
  });

  it("allows customer full name and phone without vehicle data", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
    });

    expect(result.success).toBe(true);
  });

  it("allows only vehicle plate when customer full name and phone are valid", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      vehiclePlate: "ABC1D23",
    });

    expect(result.success).toBe(true);
  });

  it("allows only vehicle model when customer full name and phone are valid", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      vehicleModel: "Honda Civic",
    });

    expect(result.success).toBe(true);
  });

  it("rejects vehicle data without customer full name and phone", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      vehiclePlate: "ABC1D23",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["customerFullName"] }),
        expect.objectContaining({ path: ["customerPhone"] }),
      ]),
    );
  });

  it("rejects vehicle data when only customer full name is filled", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      vehicleModel: "Honda Civic",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["customerPhone"] })]),
    );
  });

  it("rejects vehicle color without vehicle model", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      vehicleColor: "Preto",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["vehicleModel"] })]),
    );
  });

  it("allows vehicle color when vehicle model is filled", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      vehicleModel: "Honda Civic",
      vehicleColor: "Preto",
    });

    expect(result.success).toBe(true);
  });

  it("validates optional customer email when filled", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      customerEmail: "email-invalido",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["customerEmail"] })]),
    );
  });

  it("rejects customer email without customer full name and phone", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerEmail: "maria@email.com",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["customerFullName"] }),
        expect.objectContaining({ path: ["customerPhone"] }),
      ]),
    );
  });

  it("validates optional vehicle plate when filled", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      vehiclePlate: "ABC12",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["vehiclePlate"] })]),
    );
  });
});

describe("onboardingSchema", () => {
  it("includes the customer and vehicle step fields", () => {
    const result = onboardingSchema.safeParse({
      cnpj: "",
      legalName: "",
      tradeName: "",
      name: "",
      description: "",
      category: "",
      minDurationInMinutes: "",
      maxDurationInMinutes: "",
      price: "",
      isActive: false,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      customerEmail: "",
      vehiclePlate: "",
      vehicleModel: "",
      vehicleColor: "",
    });

    expect(result.success).toBe(true);
  });
});
