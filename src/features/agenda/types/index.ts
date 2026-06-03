import { AppointmentDTO } from "@/features/appointments/types/appointments-dto";
import { AppointmentStatus } from "@/shared/types/appointments";

export type AppointmentListItem = AppointmentDTO["appointments"][number];
export type AgendaStatusFilter = AppointmentStatus | "ALL";
export type AgendaSearchField =
  | "serviceName"
  | "vehicleModel"
  | "vehicleBrand"
  | "vehiclePlate"
  | "customerNickname"
  | "customerName";
export type AgendaPeriodMode = "custom" | "all";
