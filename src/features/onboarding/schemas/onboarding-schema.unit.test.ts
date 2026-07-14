import { describe, expect, it } from "vitest";

import {
  mapOnboardingSubmitToPayload,
  onboardingAppointmentStepSchema,
  onboardingCompanyStepSchema,
  onboardingCustomerVehicleStepSchema,
  onboardingSchema,
  onboardingServiceStepSchema,
} from "./onboarding-schema";

const emptyServiceStepValues = {
  serviceName: "",
  description: "",
  category: "",
  minDurationInMinutes: "",
  maxDurationInMinutes: "",
  price: "",
  isActive: true,
};

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
    const result = onboardingServiceStepSchema.safeParse(emptyServiceStepValues);

    expect(result.success).toBe(true);
  });

  it("does not treat isActive as a started service when it is the only changed field", () => {
    const result = onboardingServiceStepSchema.safeParse({
      ...emptyServiceStepValues,
      isActive: false,
    });

    expect(result.success).toBe(true);
  });

  it("requires service core fields when any service field is filled", () => {
    const result = onboardingServiceStepSchema.safeParse({
      ...emptyServiceStepValues,
      description: "Lavagem externa simples.",
      isActive: false,
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["serviceName"] }),
        expect.objectContaining({ path: ["minDurationInMinutes"] }),
        expect.objectContaining({ path: ["price"] }),
        expect.objectContaining({ path: ["category"] }),
      ]),
    );
  });

  it("requires category when category is the only started service field", () => {
    const result = onboardingServiceStepSchema.safeParse({
      ...emptyServiceStepValues,
      category: "category-id",
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

  it("requires category when service core fields are filled without category", () => {
    const result = onboardingServiceStepSchema.safeParse({
      serviceName: "Lavagem premium",
      description: "",
      category: "",
      minDurationInMinutes: "00:30",
      maxDurationInMinutes: "",
      price: "120,00",
      isActive: true,
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["category"],
          message: "Selecione uma categoria.",
        }),
      ]),
    );
  });

  it("allows a filled service when required fields are valid", () => {
    const result = onboardingServiceStepSchema.safeParse({
      serviceName: "Lavagem premium",
      description: "",
      category: "category-id",
      minDurationInMinutes: "00:30",
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
      minDurationInMinutes: "01:00",
      maxDurationInMinutes: "00:30",
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
    vehicleBrand: "",
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

  it("rejects vehicle plate without brand and model", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      vehiclePlate: "ABC1D23",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["vehicleBrand"], message: "Informe a marca." }),
        expect.objectContaining({ path: ["vehicleModel"], message: "Informe o modelo." }),
      ]),
    );
  });

  it("rejects only model without brand when vehicle data is started", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      vehicleModel: "Civic",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["vehicleBrand"], message: "Informe a marca." }),
      ]),
    );
    expect(result.error.issues).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["vehicleModel"] })]),
    );
  });

  it("rejects only brand without model when vehicle data is started", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      vehicleBrand: "Honda",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["vehicleModel"], message: "Informe o modelo." }),
      ]),
    );
    expect(result.error.issues).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["vehicleBrand"] })]),
    );
  });

  it("allows brand and model when customer full name and phone are valid", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      vehicleBrand: "Honda",
      vehicleModel: "Civic",
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
      vehicleBrand: "Honda",
      vehicleModel: "Civic",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["customerPhone"] })]),
    );
  });

  it("rejects vehicle color without brand and model", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      vehicleColor: "Preto",
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["vehicleBrand"] }),
        expect.objectContaining({ path: ["vehicleModel"] }),
      ]),
    );
  });

  it("allows vehicle color when brand and model are filled", () => {
    const result = onboardingCustomerVehicleStepSchema.safeParse({
      ...emptyCustomerVehicleStepValues,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      vehicleBrand: "Honda",
      vehicleModel: "Civic",
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
      ...emptyServiceStepValues,
      isActive: false,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      customerEmail: "",
      vehiclePlate: "",
      vehicleBrand: "",
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
      ...emptyServiceStepValues,
      customerFullName: "",
      customerPhone: "",
      customerEmail: "",
      vehiclePlate: "",
      vehicleBrand: "",
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
        expect.objectContaining({ path: ["vehicleBrand"] }),
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
      minDurationInMinutes: "00:30",
      maxDurationInMinutes: "01:00",
      price: "120,50",
      isActive: true,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      customerEmail: "maria@email.com",
      vehiclePlate: "abc1d23",
      vehicleBrand: "Honda",
      vehicleModel: "Civic",
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
        categoryId: "category-id",
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
        brand: "Honda",
        model: "Civic",
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
      ...emptyServiceStepValues,
      isActive: false,
      customerFullName: "",
      customerPhone: "",
      customerEmail: "",
      vehiclePlate: "",
      vehicleBrand: "",
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
      category: "category-id",
      minDurationInMinutes: "00:30",
      maxDurationInMinutes: "",
      price: "120,00",
      customerFullName: "",
      customerPhone: "",
      customerEmail: "",
      vehiclePlate: "",
      vehicleBrand: "",
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
      category: "category-id",
      minDurationInMinutes: "00:30",
      maxDurationInMinutes: "",
      price: "120,00",
      isActive: true,
      customerFullName: "Maria Oliveira",
      customerPhone: "(11) 99999-9999",
      customerEmail: "",
      vehiclePlate: "",
      vehicleBrand: "",
      vehicleModel: "",
      vehicleColor: "",
      startsAt: new Date(2026, 8, 9, 9, 27),
      endsAt: new Date(2026, 8, 9, 10, 27),
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["vehicleBrand"] })]),
    );
  });
});
