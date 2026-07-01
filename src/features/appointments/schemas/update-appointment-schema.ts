import { z } from "zod";

import {
  appointmentDateRangeRefinement,
  appointmentFormFieldsSchema,
  isAppointmentDateRangeValid,
  validateAppointmentDiscount,
  validateAppointmentServicePrices,
} from "./create-appointment-schema";

export const updateAppointmentFormSchema = z
  .object({
    customerId: appointmentFormFieldsSchema.customerId.optional(),
    serviceIds: appointmentFormFieldsSchema.serviceIds.optional(),
    services: appointmentFormFieldsSchema.services.optional(),
    vehicleId: appointmentFormFieldsSchema.vehicleId.optional(),
    startsAt: appointmentFormFieldsSchema.startsAt.optional(),
    endsAt: appointmentFormFieldsSchema.endsAt.optional(),
    description: appointmentFormFieldsSchema.description.optional(),
    discountValue: appointmentFormFieldsSchema.discountValue.optional(),
  })
  .superRefine((values, context) => {
    if (values.services) {
      validateAppointmentServicePrices(values.services, context);
    }

    validateAppointmentDiscount(values, context);
  })
  .refine(isAppointmentDateRangeValid, appointmentDateRangeRefinement);

export type UpdateAppointmentFormInput = z.input<typeof updateAppointmentFormSchema>;
export type UpdateAppointmentFormValues = z.output<typeof updateAppointmentFormSchema>;
export type UpdateAppointmentRequestBody = Omit<
  UpdateAppointmentFormValues,
  "discountValue" | "serviceIds" | "services"
> & {
  discountInCents?: number | null;
  services?: Array<{
    serviceId: string;
    priceInCents: number;
  }>;
};
