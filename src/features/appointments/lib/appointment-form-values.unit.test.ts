import { describe, expect, it } from "vitest";

import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import {
  formatCentsToBrlInput,
  getAppointmentFormDefaultValues,
  hasResourceChanged,
  resolveServicePriceMetadata,
} from "./appointment-form-values";

const appointment: AppointmentCalendarEvent = {
  id: "appointment-1",
  title: "Wash",
  startsAt: new Date("2026-05-20T08:30:00.000Z"),
  end: new Date("2026-05-20T10:00:00.000Z"),
  extendedProps: {
    customerId: "customer-1",
    customer: "Customer",
    serviceIds: [
      { value: "service-1", label: "Wash" },
      { value: "service-2", label: "Polish" },
    ],
    services: [
      {
        serviceId: "service-1",
        label: "Wash",
        priceInCents: 9000,
        currentResourceStatus: "UPDATED",
      },
      {
        serviceId: "service-2",
        label: "Polish",
        priceInCents: 12000,
        currentResourceStatus: "UNCHANGED",
      },
    ],
    service: "Wash, Polish",
    vehicleId: "vehicle-1",
    vehicle: {
      plate: "ABC-1234",
      brand: "",
      model: "",
      displayName: "ABC-1234",
    },
    endsAt: new Date("2026-05-20T10:00:00.000Z"),
    description: "Original note",
    discountValue: "15,00",
    notes: "Original note",
    tone: "info",
    status: "SCHEDULED",
  },
};

describe("appointment form values helpers", () => {
  it("builds edit default values from an appointment snapshot", () => {
    expect(getAppointmentFormDefaultValues(appointment)).toEqual({
      customerId: "customer-1",
      serviceIds: [
        { value: "service-1", label: "Wash" },
        { value: "service-2", label: "Polish" },
      ],
      services: [
        {
          serviceId: "service-1",
          serviceLabel: "Wash",
          source: "snapshot",
          priceType: "FIXED",
          minPriceInCents: 9000,
          price: "90,00",
        },
        {
          serviceId: "service-2",
          serviceLabel: "Polish",
          source: "catalog",
          priceType: "FIXED",
          minPriceInCents: 12000,
          price: "120,00",
        },
      ],
      vehicleId: "vehicle-1",
      startsAt: appointment.startsAt,
      endsAt: appointment.extendedProps.endsAt,
      description: "Original note",
      discountValue: "15,00",
    });
  });

  it("falls back to selected service options when priced services are absent", () => {
    const values = getAppointmentFormDefaultValues({
      ...appointment,
      extendedProps: {
        ...appointment.extendedProps,
        services: undefined,
      },
    });

    expect(values.services).toEqual([
      {
        serviceId: "service-1",
        serviceLabel: "Wash",
        source: "catalog",
        priceType: "FIXED",
        minPriceInCents: 0,
        price: "0,00",
      },
      {
        serviceId: "service-2",
        serviceLabel: "Polish",
        source: "catalog",
        priceType: "FIXED",
        minPriceInCents: 0,
        price: "0,00",
      },
    ]);
  });

  it("resolves service price metadata from option payloads", () => {
    expect(
      resolveServicePriceMetadata({
        id: "fixed",
        label: "Fixed",
        priceSpecification: { type: "FIXED", fixedPriceInCents: 9000 },
      }),
    ).toEqual({ priceType: "FIXED", minPriceInCents: 9000 });

    expect(
      resolveServicePriceMetadata({
        id: "range",
        label: "Range",
        priceSpecification: { type: "RANGE", minPriceInCents: 5000, maxPriceInCents: 10000 },
      }),
    ).toEqual({ priceType: "RANGE", minPriceInCents: 5000, maxPriceInCents: 10000 });

    expect(resolveServicePriceMetadata({ id: "legacy", label: "Legacy", priceInCents: -100 }))
      .toEqual({
        priceType: "FIXED",
        minPriceInCents: 0,
      });
  });

  it("formats cents and identifies changed resources", () => {
    expect(formatCentsToBrlInput(12345)).toBe("123,45");
    expect(formatCentsToBrlInput(-10)).toBe("0,00");
    expect(hasResourceChanged("UPDATED")).toBe(true);
    expect(hasResourceChanged("DELETED")).toBe(true);
    expect(hasResourceChanged("UNCHANGED")).toBe(false);
    expect(hasResourceChanged()).toBe(false);
  });
});
