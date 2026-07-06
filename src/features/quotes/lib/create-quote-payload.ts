import type {
  QuoteCustomerVehicleStepPayload,
  QuoteCustomerVehicleStepValues,
  QuoteServicesStepPayload,
  QuoteServicesStepValues,
} from "../types/create-quote";

export function mapQuoteCustomerVehicleStepToPayload(
  values: QuoteCustomerVehicleStepValues,
): QuoteCustomerVehicleStepPayload {
  return {
    ...(values.customerId
      ? { customerId: values.customerId }
      : {
          customer: values.customer,
        }),
    ...(values.vehicleId
      ? { vehicleId: values.vehicleId }
      : {
          vehicle: values.vehicle,
        }),
  };
}

export function mapQuoteServicesStepToPayload(
  values: QuoteServicesStepValues,
): QuoteServicesStepPayload {
  return {
    services: values.services.map((service) => ({
      ...(service.serviceId ? { serviceId: service.serviceId } : {}),
      ...(service.serviceName ? { serviceName: service.serviceName } : {}),
      ...(service.priceInCents !== undefined ? { priceInCents: service.priceInCents } : {}),
      ...(service.isCourtesy !== undefined ? { isCourtesy: service.isCourtesy } : {}),
    })),
  };
}
