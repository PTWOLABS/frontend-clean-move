import { ServiceCategoryCode } from "@/features/establishment/types";
import { AppointmentStatus } from "@/shared/types/appointments";

export type AppointmentDTO = {
  appointments: {
    id: string;
    establishmentId: string;
    customerId: string;
    vehicleId: string | null;
    service: {
      id: string;
      name: string;
      category: ServiceCategoryCode | null;
      durationInMinutes: number | null;
      priceInCents: number;
    };
    vehicle: {
      plate: string | null;
      brand: string | null;
      model: string | null;
      color: string | null;
      year: number | null;
    } | null;
    startsAt: string;
    endsAt: string | null;
    description: string | null;
    discountInCents: number | null;
    status: AppointmentStatus;
    createdAt: string;
    updatedAt: string;
    doneAt: string | null;
    cancelledAt: string | null;
  }[];
};
