import { describe, expect, it } from "vitest";

import {
  mapOnboardingSubmitToPayload,
  onboardingAppointmentStepSchema,
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
      serviceName: "",
      description: "",
      category: "",
      minDurationInMinutes: "",
      maxDurationInMinutes: "",
      price: "",
      isActive: true,
    });

    expect(result.success).toBe(true);
  });

  it("does not treat isActive as a started service when it is the only changed field", () => {
    const result = onboardingServiceStepSchema.safeParse({
      serviceName: "",
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
      serviceName: "",
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
        expect.objectContaining({ path: ["serviceName"] }),
        expect.objectContaining({ path: ["minDurationInMinutes"] }),
        expect.objectContaining({ path: ["price"] }),
      ]),
    );
  });

  it("treats category as a started service without requiring category itself", () => {
    const result = onboardingServiceStepSchema.safeParse({
      serviceName: "",
      description: "",
      category: "category-id",
      minDurationInMinutes: "",
      maxDurationInMinutes: "",
      price: "",
      isActive: true,
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["serviceName"] }),
        expect.objectContaining({ path: ["minDurationInMinutes"] }),
        expect.objectContaining({ path: ["price"] }),
      ]),
    );
    expect(result.error.issues).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["category"] })]),
    );
  });

  it("allows a filled service when required fields are valid", () => {
    const result = onboardingServiceStepSchema.safeParse({
      serviceName: "Lavagem premium",
      description: "",
      category: "",
      minDurationInMinutes: "30",
      maxDurationInMinutes: "",
      price: "120,00",
      isActive: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects max duration smaller than min duration", () => {
    const result = onboardingServiceStepSchema.safeParse({
      serviceName: "Lavagem premium",
      description: "",
      category: "category-id",
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

  it("rejects vehicle plate without vehicle model", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      vehiclePlate: "ABC1D23",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["vehicleModel"] })]),
    );
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

describe("onboardingAppointmentStepSchema", () => {
  const emptyAppointmentStepValues = {
    startsAt: null,
    endsAt: null,
  };

  it("allows the appointment step to be empty", () => {
    const result = onboardingAppointmentStepSchema.safeParse(emptyAppointmentStepValues);

    expect(result.success).toBe(true);
  });

  it("allows a filled appointment when start date is valid", () => {
    const result = onboardingAppointmentStepSchema.safeParse({
      startsAt: new Date("2026-09-09T09:27:00"),
      endsAt: null,
    });

    expect(result.success).toBe(true);
  });

  it("allows a filled appointment with start and end dates", () => {
    const result = onboardingAppointmentStepSchema.safeParse({
      startsAt: new Date("2026-09-09T09:27:00"),
      endsAt: new Date("2026-09-09T10:27:00"),
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid start date", () => {
    const result = onboardingAppointmentStepSchema.safeParse({
      ...emptyAppointmentStepValues,
      startsAt: "data-invalida",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["startsAt"] })]),
    );
  });

  it("rejects an invalid end date", () => {
    const result = onboardingAppointmentStepSchema.safeParse({
      ...emptyAppointmentStepValues,
      startsAt: new Date("2026-09-09T09:27:00"),
      endsAt: "data-invalida",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["endsAt"] })]),
    );
  });

  it("rejects end date before start date", () => {
    const result = onboardingAppointmentStepSchema.safeParse({
      ...emptyAppointmentStepValues,
      startsAt: new Date("2026-09-09T09:27:00"),
      endsAt: new Date("2026-09-09T08:27:00"),
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["endsAt"] })]),
    );
  });

  it("requires start date when end date is filled", () => {
    const result = onboardingAppointmentStepSchema.safeParse({
      ...emptyAppointmentStepValues,
      endsAt: new Date("2026-09-09T10:27:00"),
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["startsAt"] })]),
    );
  });
});

describe("onboardingSchema", () => {
  it("includes the customer and vehicle step fields", () => {
    const result = onboardingSchema.safeParse({
      cnpj: "",
      legalName: "",
      tradeName: "",
      serviceName: "",
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
      startsAt: null,
      endsAt: null,
    });

    expect(result.success).toBe(true);
  });

  it("requires customer, service and vehicle when start date is filled", () => {
    const result = onboardingSchema.safeParse({
      cnpj: "",
      legalName: "",
      tradeName: "",
      serviceName: "",
      description: "",
      category: "",
      minDurationInMinutes: "",
      maxDurationInMinutes: "",
      price: "",
      isActive: true,
      customerFullName: "",
      customerPhone: "",
      customerEmail: "",
      vehiclePlate: "",
      vehicleModel: "",
      vehicleColor: "",
      startsAt: new Date(2026, 8, 9, 9, 27),
      endsAt: null,
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["customerFullName"] }),
        expect.objectContaining({ path: ["serviceName"] }),
        expect.objectContaining({ path: ["vehicleModel"] }),
      ]),
    );
  });
});

describe("mapOnboardingSubmitToPayload", () => {
  it("maps filled onboarding values to the API payload", () => {
    const result = onboardingSchema.safeParse({
      cnpj: "12.345.678/0001-90",
      legalName: "Clean Move LTDA",
      tradeName: "Clean Move",
      serviceName: "Lavagem premium",
      description: "Lavagem completa.",
      category: "category-id",
      minDurationInMinutes: "30",
      maxDurationInMinutes: "60",
      price: "120,50",
      isActive: true,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      customerEmail: "maria@email.com",
      vehiclePlate: "abc1d23",
      vehicleModel: "Honda Civic",
      vehicleColor: "Preto",
      startsAt: new Date(2026, 8, 9, 9, 27),
      endsAt: new Date(2026, 8, 9, 10, 27),
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(mapOnboardingSubmitToPayload(result.data)).toEqual({
      establishment: {
        tradeName: "Clean Move",
        legalBusinessName: "Clean Move LTDA",
        cnpj: "12345678000190",
      },
      service: {
        serviceName: "Lavagem premium",
        description: "Lavagem completa.",
        category: "category-id",
        estimatedDuration: {
          minInMinutes: 30,
          maxInMinutes: 60,
        },
        price: 12050,
        isActive: true,
      },
      customer: {
        fullName: "Maria Oliveira",
        phone: "11999999999",
        email: "maria@email.com",
      },
      vehicle: {
        plate: "ABC1D23",
        model: "Honda Civic",
        color: "Preto",
      },
      appointment: {
        startsAt: "2026-09-09T09:27:00.000Z",
        endsAt: "2026-09-09T10:27:00.000Z",
      },
    });
  });

  it("omits empty resource sections", () => {
    const result = onboardingSchema.safeParse({
      cnpj: "",
      legalName: "",
      tradeName: "",
      serviceName: "",
      description: "",
      category: "",
      minDurationInMinutes: "",
      maxDurationInMinutes: "",
      price: "",
      isActive: false,
      customerFullName: "",
      customerPhone: "",
      customerEmail: "",
      vehiclePlate: "",
      vehicleModel: "",
      vehicleColor: "",
      startsAt: null,
      endsAt: null,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(mapOnboardingSubmitToPayload(result.data)).toEqual({});
  });

  it("defaults created services to active when isActive is not provided", () => {
    const result = onboardingSchema.safeParse({
      cnpj: "",
      legalName: "",
      tradeName: "",
      serviceName: "Lavagem premium",
      description: "",
      category: "",
      minDurationInMinutes: "30",
      maxDurationInMinutes: "",
      price: "120,00",
      customerFullName: "",
      customerPhone: "",
      customerEmail: "",
      vehiclePlate: "",
      vehicleModel: "",
      vehicleColor: "",
      startsAt: null,
      endsAt: null,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(mapOnboardingSubmitToPayload(result.data).service?.isActive).toBe(true);
  });

  it("does not parse appointment when a dependent resource is missing", () => {
    const result = onboardingSchema.safeParse({
      cnpj: "",
      legalName: "",
      tradeName: "",
      serviceName: "Lavagem premium",
      description: "",
      category: "",
      minDurationInMinutes: "30",
      maxDurationInMinutes: "",
      price: "120,00",
      isActive: true,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      customerEmail: "",
      vehiclePlate: "",
      vehicleModel: "",
      vehicleColor: "",
      startsAt: new Date(2026, 8, 9, 9, 27),
      endsAt: new Date(2026, 8, 9, 10, 27),
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["vehicleModel"] })]),
    );
  });
});
