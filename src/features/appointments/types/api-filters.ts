import type { VehicleOptionsQuery } from "@/features/vehicle/types";
import type { OptionsQuery } from "@/shared/types/options-query";
import type { AppointmentStatus } from "@/shared/types/appointments";
import { PaginationParams } from "@/shared/types/pagination";

export type AppointmentsFilters = {
  startsAt?: string;
  endsAt?: string;
  status?: AppointmentStatus[];
  serviceName?: string;
  serviceId?: string;
  vehicleModel?: string;
  vehicleBrand?: string;
  vehiclePlate?: string;
  vehicleId?: string;
  customerNickname?: string;
  customerName?: string;
  customerId?: string;
  search?: string; //General text search across customer full name, customer nickname, booked service name, vehicle plate, vehicle brand, and vehicle model. Non-alphanumeric characters are removed when matching against vehicle plate.
} & PaginationParams;

export type AppointmentsCalendarFilters = {
  startsAt: string;
  endsAt: string;
  status?: AppointmentStatus[];
};

/** Filters da query key / hook (sem `page` — pageParam do infinite query). */
export type OptionsFilters = OptionsQuery;

export type VehicleOptionsFilters = VehicleOptionsQuery;
