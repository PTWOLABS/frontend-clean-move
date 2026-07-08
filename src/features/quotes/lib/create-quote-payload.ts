import { onlyDigits } from "@/shared/utils/lib";

import type {
  CreateQuoteBody,
  CreateQuoteFormValues,
  QuoteCustomerVehicleStepPayload,
  QuoteCustomerVehicleStepValues,
  QuotePaymentStepPayload,
  QuotePaymentStepValues,
  QuoteServicesStepPayload,
  QuoteServicesStepValues,
} from "../types/create-quote";

export function buildCreateQuoteBody(values: CreateQuoteFormValues): CreateQuoteBody {
  return {
    ...mapQuoteCustomerVehicleStepToPayload(values.stepOne),
    ...mapQuoteServicesStepToPayload(values.stepTwo),
    ...mapQuotePaymentStepToPayload(values.stepThree),
  };
}

export function mapQuoteCustomerVehicleStepToPayload(
  values: QuoteCustomerVehicleStepValues,
): QuoteCustomerVehicleStepPayload {
  return {
    ...(values.customerId
      ? { customerId: values.customerId }
      : {
          customer: {
            name: values.customer.name,
            phone: normalizeOptionalPhone(values.customer.phone),
            cpfCnpj: values.customer.cpfCnpj,
          },
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
    serviceItems: values.services.map((service) => ({
      ...(service.serviceId ? { serviceId: service.serviceId } : {}),
      ...(service.serviceName ? { serviceName: service.serviceName } : {}),
      ...(service.priceInCents !== undefined ? { priceInCents: service.priceInCents } : {}),
      ...(service.isCourtesy !== undefined ? { isCourtesy: service.isCourtesy } : {}),
    })),
  };
}

function normalizeOptionalPhone(value: string | null | undefined) {
  const digits = onlyDigits(value ?? "");

  return digits.length > 0 ? digits : null;
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
