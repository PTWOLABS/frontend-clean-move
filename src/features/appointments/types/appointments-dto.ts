import { AppointmentStatus } from "@/shared/types/appointments";
import type { ServiceCategoryRef } from "@/features/service-category/types";

export type ResourceStatus = "UNCHANGED" | "UPDATED" | "DELETED";

export type AppointmentDTO = {
  appointments: {
    id: string;
    establishmentId: string;
    customerId: string;
    customer?: {
      fullName?: string | null;
      currentResourceStatus: ResourceStatus;
    } | null;
    vehicleId: string | null;
    services: {
      id: string;
      name: string;
      category: ServiceCategoryRef | null;
      durationInMinutes: number | null;
      priceInCents: number;
      currentResourceStatus: ResourceStatus;
    }[];
    vehicle: {
      plate: string | null;
      brand: string | null;
      model: string | null;
      color: string | null;
      year: number | null;
      currentResourceStatus: ResourceStatus;
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
  totalItems?: number;
};

export type UpdateAppointmentStatusDTO = {
  appointment: {
    id: string;
    status: AppointmentStatus;
    updatedAt: string;
    doneAt?: string | null;
    cancelledAt?: string | null;
  };
};

export type UpdateAppointmentDTO = {
  appointment: AppointmentDTO["appointments"][number];
};
