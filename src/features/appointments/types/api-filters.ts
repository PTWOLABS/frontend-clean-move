import { AppointmentStatus } from "@/shared/types/appointments";

export type AppointmentsFilters = {
  startsAt: string;
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
};

