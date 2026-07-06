import type {
  QuoteCustomerVehicleStepPayload,
  QuoteCustomerVehicleStepValues,
  QuotePaymentStepPayload,
  QuotePaymentStepValues,
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

export function mapQuotePaymentStepToPayload(
  values: QuotePaymentStepValues,
): QuotePaymentStepPayload {
  return {
    paymentOptions: values.paymentOptions.map((paymentOption) => ({
      method: paymentOption.method,
      label: paymentOption.label,
      ...(paymentOption.installments !== undefined
        ? { installments: paymentOption.installments }
        : {}),
      ...(paymentOption.interestFree !== undefined
        ? { interestFree: paymentOption.interestFree }
        : {}),
      ...(paymentOption.discountType !== undefined
        ? { discountType: paymentOption.discountType }
        : {}),
      ...(paymentOption.discountValue !== undefined
        ? { discountValue: paymentOption.discountValue }
        : {}),
    })),
  };
}
