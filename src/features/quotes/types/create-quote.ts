import type { z } from "zod";

import type {
  createQuoteFormSchema,
  quoteCustomerVehicleStepSchema,
} from "../schemas/create-quote-schema";

export type QuoteCustomerVehicleStepInput = z.input<typeof quoteCustomerVehicleStepSchema>;
export type QuoteCustomerVehicleStepValues = z.output<typeof quoteCustomerVehicleStepSchema>;

export type CreateQuoteFormInput = z.input<typeof createQuoteFormSchema>;
export type CreateQuoteFormValues = z.output<typeof createQuoteFormSchema>;
