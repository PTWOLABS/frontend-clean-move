import type { z } from "zod";

import type {
  createQuoteFormSchema,
  quoteCustomerVehicleStepSchema,
  quotePaymentStepSchema,
  quoteServicesStepSchema,
} from "../schemas/create-quote-schema";

export type QuoteCustomerVehicleStepInput = z.input<typeof quoteCustomerVehicleStepSchema>;
export type QuoteCustomerVehicleStepValues = z.output<typeof quoteCustomerVehicleStepSchema>;
export type QuoteServicesStepInput = z.input<typeof quoteServicesStepSchema>;
export type QuoteServicesStepValues = z.output<typeof quoteServicesStepSchema>;
export type QuotePaymentStepInput = z.input<typeof quotePaymentStepSchema>;
export type QuotePaymentStepValues = z.output<typeof quotePaymentStepSchema>;

export type CreateQuoteFormInput = z.input<typeof createQuoteFormSchema>;
export type CreateQuoteFormValues = z.output<typeof createQuoteFormSchema>;

export type QuoteCustomerVehicleStepPayload = {
  customerId?: string | null;
  customer?: {
    name: string;
    phone?: string | null;
    cpfCnpj?: string | null;
  };
  vehicleId?: string | null;
  vehicle?: QuoteCustomerVehicleStepValues["vehicle"] | null;
};

export type QuoteServicesStepPayload = {
  serviceItems: Array<{
    serviceId?: string | null;
    serviceName?: string;
    priceInCents?: number;
    isCourtesy?: boolean;
  }>;
};

export type CreateQuoteBody = QuoteCustomerVehicleStepPayload &
  QuoteServicesStepPayload &
  QuotePaymentStepPayload & {
    description?: string | null;
  };

export type QuotePaymentStepPayload = {
  paymentOptions: Array<{
    method: QuotePaymentStepValues["paymentOptions"][number]["method"];
    label: string;
    installments?: number | null;
    interestFree?: boolean | null;
    discountType?: QuotePaymentStepValues["paymentOptions"][number]["discountType"];
    discountValue?: number | null;
  }>;
  termsAndConditions?: string | null;
  expiresAt?: string | null;
};
