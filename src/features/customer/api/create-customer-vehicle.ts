import { httpClient } from "@/shared/api/httpClient";

import type { CreateCustomerVehiclePayload, CustomerVehicleDto } from "../types";

type CreateCustomerVehicleResponse = {
  vehicle: CustomerVehicleDto;
};

export async function createCustomerVehicle(
  customerId: string,
  payload: CreateCustomerVehiclePayload,
) {
  return httpClient<CreateCustomerVehicleResponse>(`/customers/${customerId}/vehicles`, {
    method: "POST",
    body: payload,
  });
}
