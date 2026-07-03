import type {
  QuoteCustomerVehicleStepPayload,
  QuoteCustomerVehicleStepValues,
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
