import { ApiError } from "@/shared/api/httpClient";

import type { CustomerDto } from "../types";

export class CustomerPartialCreationError extends Error {
  readonly customer: CustomerDto;
  readonly apiError: ApiError;

  constructor(customer: CustomerDto, apiError: ApiError) {
    super(apiError.message, { cause: apiError });
    this.name = "CustomerPartialCreationError";
    this.customer = customer;
    this.apiError = apiError;
  }
}

export function isCustomerPartialCreationError(
  error: unknown,
): error is CustomerPartialCreationError {
  return error instanceof CustomerPartialCreationError;
}
