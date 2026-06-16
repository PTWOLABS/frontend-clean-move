import { z } from "zod";

import {
  appointmentDateRangeRefinement,
  appointmentFormFieldsSchema,
  isAppointmentDateRangeValid,
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
  .refine(isAppointmentDateRangeValid, appointmentDateRangeRefinement);

export type UpdateAppointmentFormInput = z.input<typeof updateAppointmentFormSchema>;
export type UpdateAppointmentFormValues = z.output<typeof updateAppointmentFormSchema>;
export type UpdateAppointmentRequestBody = Omit<
  UpdateAppointmentFormValues,
  "serviceIds" | "services"
> & {
  serviceIds?: string[];
  services?: Array<{
    serviceId: string;
    priceInCents: string;
  }>;
};
