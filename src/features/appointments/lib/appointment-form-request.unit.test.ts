import { describe, expect, it } from "vitest";

import type {
  CreateAppointmentFormInput,
  CreateAppointmentFormValues,
  CreateAppointmentRequestBody,
} from "../schemas/create-appointment-schema";
import {
  areAppointmentServicesEqual,
  buildAppointmentRequestBody,
  getChangedRequestBody,
  getComparableRequestBody,
} from "./appointment-form-request";

const formValues: CreateAppointmentFormValues = {
  customerId: "customer-1",
  serviceIds: [{ value: "service-1", label: "Wash" }],
  services: [
    {
      serviceId: "service-1",
      serviceLabel: "Wash",
      source: "catalog",
      priceType: "STARTING_AT",
      minPriceInCents: 5000,
      price: "90,50",
    },
  ],
  vehicleId: "vehicle-1",
  startsAt: "2026-05-20T08:30:00.000Z",
  endsAt: null,
  description: "Original note",
  discountValue: "10,00",
};

describe("appointment form request helpers", () => {
  it("builds the API request body from parsed form values", () => {
    expect(buildAppointmentRequestBody(formValues)).toEqual({
      customerId: "customer-1",
      vehicleId: "vehicle-1",
      startsAt: "2026-05-20T08:30:00.000Z",
      endsAt: null,
      description: "Original note",
      discountValue: "10,00",
      services: [{ serviceId: "service-1", priceInCents: 9050 }],
    });
  });

  it("parses comparable request bodies from raw form input", () => {
    const input: CreateAppointmentFormInput = {
      ...formValues,
      startsAt: new Date("2026-05-20T08:30:00.000Z"),
      description: " Original note ",
    };

    expect(getComparableRequestBody(input)).toEqual(
      expect.objectContaining({
        customerId: "customer-1",
        vehicleId: "vehicle-1",
        description: "Original note",
        discountValue: "10,00",
        services: [{ serviceId: "service-1", priceInCents: 9050 }],
      }),
    );
  });

  it("returns null when comparable raw form input is invalid", () => {
    expect(getComparableRequestBody({ ...formValues, customerId: "" })).toBeNull();
  });

  it("returns only fields changed during update", () => {
    const initialBody: CreateAppointmentRequestBody = buildAppointmentRequestBody(formValues);
    const currentBody: CreateAppointmentRequestBody = {
      ...initialBody,
      description: "New note",
      services: [{ serviceId: "service-1", priceInCents: 10000 }],
    };

    expect(getChangedRequestBody(currentBody, initialBody)).toEqual({
      description: "New note",
      services: [{ serviceId: "service-1", priceInCents: 10000 }],
    });
  });

  it("returns the full body when there is no initial body to compare", () => {
    const currentBody = buildAppointmentRequestBody(formValues);

    expect(getChangedRequestBody(currentBody, null)).toBe(currentBody);
  });

  it("compares appointment services by order, id, and price", () => {
    expect(
      areAppointmentServicesEqual(
        [
          { serviceId: "service-1", priceInCents: 9000 },
          { serviceId: "service-2", priceInCents: 12000 },
        ],
        [
          { serviceId: "service-1", priceInCents: 9000 },
          { serviceId: "service-2", priceInCents: 12000 },
        ],
      ),
    ).toBe(true);

    expect(
      areAppointmentServicesEqual(
        [
          { serviceId: "service-1", priceInCents: 9000 },
          { serviceId: "service-2", priceInCents: 12000 },
        ],
        [
          { serviceId: "service-2", priceInCents: 12000 },
          { serviceId: "service-1", priceInCents: 9000 },
        ],
      ),
    ).toBe(false);
  });
});
