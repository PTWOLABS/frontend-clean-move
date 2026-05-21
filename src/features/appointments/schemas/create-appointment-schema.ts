import z from "zod";

export const createAppointmentBodySchema = z.object({
  customerId: z.uuid(),
  serviceId: z.uuid(),
  vehicleId: z.uuid().optional().nullable(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  discountInCents: z.number().int().nonnegative().optional().nullable(),
});

export type CreateAppointmentBodySchema = z.infer<typeof createAppointmentBodySchema>;
