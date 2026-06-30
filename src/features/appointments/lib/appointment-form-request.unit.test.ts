import { describe, expect, it } from "vitest";

import type {
  CreateAppointmentFormInput,
  CreateAppointmentFormValues,
  CreateAppointmentRequestBody,
} from "../schemas/create-appointment-schema";
import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import {
  areAppointmentServicesEqual,
  buildAppointmentRequestBody,
  getChangedRequestBody,
  getComparableRequestBody,
  getResolvedResourceRequestFields,
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

const appointment: AppointmentCalendarEvent = {
  id: "appointment-1",
  title: "Wash",
  startsAt: new Date("2026-05-20T08:30:00.000Z"),
  end: new Date("2026-05-20T09:30:00.000Z"),
  extendedProps: {
    customerId: "customer-1",
    customer: "Old customer",
    customerResourceStatus: "UPDATED",
    serviceIds: [{ value: "service-1", label: "Old wash" }],
    services: [
      {
        serviceId: "service-1",
        label: "Old wash",
        priceInCents: 9050,
        currentResourceStatus: "UPDATED",
      },
    ],
    service: "Old wash",
    vehicleId: "vehicle-1",
    vehicle: {
      plate: "ABC1234",
      brand: "Honda",
      model: "Civic",
      displayName: "Old vehicle",
      currentResourceStatus: "UPDATED",
    },
    endsAt: null,
    description: "Original note",
    discountValue: "10,00",
    notes: "Original note",
    tone: "info",
    status: "SCHEDULED",
  },
};

describe("appointment form request helpers", () => {
  it("builds the API request body from parsed form values", () => {
    expect(buildAppointmentRequestBody(formValues)).toEqual({
      customerId: "customer-1",
      vehicleId: "vehicle-1",
      startsAt: "2026-05-20T08:30:00.000Z",
      endsAt: null,
      description: "Original note",
      discountInCents: 1000,
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
        discountInCents: 1000,
        services: [{ serviceId: "service-1", priceInCents: 9050 }],
      }),
    );
  });

  it("maps an empty discount form value to null", () => {
    expect(buildAppointmentRequestBody({ ...formValues, discountValue: "" })).toEqual(
      expect.objectContaining({
        discountInCents: null,
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
      discountInCents: 1500,
      services: [{ serviceId: "service-1", priceInCents: 10000 }],
    };

    expect(getChangedRequestBody(currentBody, initialBody)).toEqual({
      description: "New note",
      discountInCents: 1500,
      services: [{ serviceId: "service-1", priceInCents: 10000 }],
    });
  });

  it("includes forced fields even when the comparable value did not change", () => {
    const initialBody: CreateAppointmentRequestBody = buildAppointmentRequestBody(formValues);
    const currentBody: CreateAppointmentRequestBody = {
      ...initialBody,
    };

    expect(
      getChangedRequestBody(currentBody, initialBody, {
        forceFields: ["vehicleId", "services"],
      }),
    ).toEqual({
      vehicleId: "vehicle-1",
      services: [{ serviceId: "service-1", priceInCents: 9050 }],
    });
  });

  it("detects resources resolved from a changed snapshot", () => {
    expect(
      getResolvedResourceRequestFields(
        appointment,
        {
          customerId: "customer-1",
          vehicleId: "vehicle-1",
          services: [
            {
              serviceId: "service-1",
              serviceLabel: "Current wash",
              source: "catalog",
              priceType: "STARTING_AT",
              minPriceInCents: 9050,
              price: "90,50",
            },
          ],
        },
        {
          customerLabel: "Current customer",
          vehicleLabel: "Current vehicle",
        },
      ),
    ).toEqual(["customerId", "vehicleId", "services"]);
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
