import { describe, expect, it } from "vitest";

import type {
  QuoteCustomerVehicleStepValues,
  QuoteServicesStepValues,
} from "../types/create-quote";
import {
  mapQuoteCustomerVehicleStepToPayload,
  mapQuoteServicesStepToPayload,
} from "./create-quote-payload";

describe("mapQuoteCustomerVehicleStepToPayload", () => {
  it("uses only customerId when an existing customer is selected", () => {
    const values = makeStepValues({
      customerId: "customer-1",
      customer: {
        name: "Maria Silva",
        phone: "11999999999",
        email: "maria@example.com",
        cpfCnpj: "52998224725",
      },
    });

    expect(mapQuoteCustomerVehicleStepToPayload(values)).toMatchObject({
      customerId: "customer-1",
    });
    expect(mapQuoteCustomerVehicleStepToPayload(values)).not.toHaveProperty("customer");
  });

  it("uses customer data when no existing customer is selected", () => {
    const values = makeStepValues({
      customerId: null,
      customer: {
        name: "Maria Silva",
        phone: "11999999999",
        email: "maria@example.com",
        cpfCnpj: "52998224725",
      },
    });

    expect(mapQuoteCustomerVehicleStepToPayload(values)).toMatchObject({
      customer: {
        name: "Maria Silva",
        phone: "11999999999",
        email: "maria@example.com",
        cpfCnpj: "52998224725",
      },
    });
    expect(mapQuoteCustomerVehicleStepToPayload(values)).not.toHaveProperty("customerId");
  });

  it("uses only vehicleId when an existing vehicle is selected", () => {
    const values = makeStepValues({
      vehicleId: "vehicle-1",
      vehicle: {
        plate: "ABC1D23",
        brand: "Honda",
        model: "Civic",
        color: "Preto",
        year: 2024,
      },
    });

    expect(mapQuoteCustomerVehicleStepToPayload(values)).toMatchObject({
      vehicleId: "vehicle-1",
    });
    expect(mapQuoteCustomerVehicleStepToPayload(values)).not.toHaveProperty("vehicle");
  });
});

describe("mapQuoteServicesStepToPayload", () => {
  it("omits serviceLabel from existing service payload", () => {
    const values: QuoteServicesStepValues = {
      services: [
        {
          serviceId: "service-1",
          serviceLabel: "Lavagem completa",
          priceInCents: 9000,
          isCourtesy: false,
        },
      ],
    };

    expect(mapQuoteServicesStepToPayload(values)).toEqual({
      services: [
        {
          serviceId: "service-1",
          priceInCents: 9000,
          isCourtesy: false,
        },
      ],
    });
  });

  it("keeps manual service name and price", () => {
    const values: QuoteServicesStepValues = {
      services: [
        {
          serviceName: "Polimento tecnico",
          priceInCents: 15000,
          isCourtesy: true,
        },
      ],
    };

    expect(mapQuoteServicesStepToPayload(values)).toEqual({
      services: [
        {
          serviceName: "Polimento tecnico",
          priceInCents: 15000,
          isCourtesy: true,
        },
      ],
    });
  });
});

function makeStepValues(
  overrides: Partial<QuoteCustomerVehicleStepValues> = {},
): QuoteCustomerVehicleStepValues {
  return {
    customerId: null,
    customer: {
      name: "Cliente teste",
      cpfCnpj: null,
      phone: null,
      email: null,
    },
    vehicleId: null,
    vehicleLabel: null,
    vehicle: {
      plate: null,
      brand: null,
      model: null,
      color: null,
      year: null,
    },
    ...overrides,
  };
}
