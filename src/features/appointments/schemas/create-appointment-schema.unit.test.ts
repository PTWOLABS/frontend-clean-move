import { describe, expect, it } from "vitest";

import { createAppointmentFormSchema } from "./create-appointment-schema";
import { updateAppointmentFormSchema } from "./update-appointment-schema";

const service = {
  serviceId: "service-1",
  serviceLabel: "Lavagem completa",
  priceType: "FIXED" as const,
  minPriceInCents: 9000,
  price: "90,00",
};

const createAppointmentValues = {
  customerId: "customer-1",
  serviceIds: [{ value: "service-1", label: "Lavagem completa" }],
  services: [service],
  vehicleId: "vehicle-1",
  startsAt: new Date("2026-05-20T09:00:00.000Z"),
  endsAt: null,
  description: "",
  discountValue: "90,00",
};

describe("appointment form schemas", () => {
  it("accepts a discount equal to the total services amount", () => {
    const result = createAppointmentFormSchema.safeParse(createAppointmentValues);

    expect(result.success).toBe(true);
  });

  it("rejects a create discount greater than the total services amount", () => {
    const result = createAppointmentFormSchema.safeParse({
      ...createAppointmentValues,
      discountValue: "90,01",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected create appointment validation to fail.");
    }

    expect(result.error.flatten().fieldErrors.discountValue).toContain(
      "O desconto não pode ser maior que o valor total dos serviços.",
    );
  });

  it("rejects an update discount greater than the total services amount", () => {
    const result = updateAppointmentFormSchema.safeParse({
      services: [service],
      discountValue: "90,01",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected update appointment validation to fail.");
    }

    expect(result.error.flatten().fieldErrors.discountValue).toContain(
      "O desconto não pode ser maior que o valor total dos serviços.",
    );
  });
});
