import { z } from "zod";

import {
  appointmentDateRangeRefinement,
  appointmentFormFieldsSchema,
  isAppointmentDateRangeValid,
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
  })
  .refine(isAppointmentDateRangeValid, appointmentDateRangeRefinement);

export type UpdateAppointmentFormInput = z.input<typeof updateAppointmentFormSchema>;
export type UpdateAppointmentFormValues = z.output<typeof updateAppointmentFormSchema>;
export type UpdateAppointmentRequestBody = Omit<
  UpdateAppointmentFormValues,
  "serviceIds" | "services"
> & {
  services?: Array<{
    serviceId: string;
    priceInCents: number;
  }>;
};
