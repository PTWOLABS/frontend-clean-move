import type { z } from "zod";

import type {
  createQuoteFormSchema,
  quoteCustomerVehicleStepSchema,
  quoteServicesStepSchema,
} from "../schemas/create-quote-schema";

export type QuoteCustomerVehicleStepInput = z.input<typeof quoteCustomerVehicleStepSchema>;
export type QuoteCustomerVehicleStepValues = z.output<typeof quoteCustomerVehicleStepSchema>;
export type QuoteServicesStepInput = z.input<typeof quoteServicesStepSchema>;
export type QuoteServicesStepValues = z.output<typeof quoteServicesStepSchema>;

export type CreateQuoteFormInput = z.input<typeof createQuoteFormSchema>;
export type CreateQuoteFormValues = z.output<typeof createQuoteFormSchema>;

export type QuoteCustomerVehicleStepPayload = {
  customerId?: string;
  customer?: QuoteCustomerVehicleStepValues["customer"];
  vehicleId?: string;
  vehicle?: QuoteCustomerVehicleStepValues["vehicle"];
};

export type QuoteServicesStepPayload = {
  services: Array<{
    serviceId?: string | null;
    serviceName?: string;
    priceInCents?: number;
    isCourtesy?: boolean;
  }>;
};
