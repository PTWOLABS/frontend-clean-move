import { formatCentsToBrlInput } from "@/shared/money/format-brl-money";
import {
  resolveServicePriceMetadata,
  type ServicePriceMetadata,
} from "@/shared/services/service-price-metadata";

import type {
  CreateAppointmentFormInput,
  CreateAppointmentFormValues,
} from "../schemas/create-appointment-schema";
import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import type { ResourceStatus } from "../types/appointments-dto";

export type AppointmentPricedService = CreateAppointmentFormValues["services"][number];

export type ServiceOptionWithPrice = ServicePriceMetadata & {
  id: string;
  label: string;
};

export { formatCentsToBrlInput, resolveServicePriceMetadata };

export function hasResourceChanged(status?: ResourceStatus) {
  return status === "UPDATED" || status === "DELETED";
}

export function getAppointmentFormDefaultValues(
  appointment: AppointmentCalendarEvent,
): CreateAppointmentFormInput {
  const pricedServices =
    appointment.extendedProps.services?.map((service) => {
      const source = hasResourceChanged(service.currentResourceStatus)
        ? ("snapshot" as const)
        : ("catalog" as const);

      return {
        serviceId: service.serviceId,
        serviceLabel: service.label,
        source,
        priceType: "FIXED" as const,
        minPriceInCents: service.priceInCents,
        price: formatCentsToBrlInput(service.priceInCents),
      };
    }) ??
    appointment.extendedProps.serviceIds.map((service) => ({
      serviceId: service.value,
      serviceLabel: service.label,
      source: "catalog" as const,
      priceType: "FIXED" as const,
      minPriceInCents: 0,
      price: "0,00",
    }));

  return {
    customerId: appointment.extendedProps.customerId,
    serviceIds: appointment.extendedProps.serviceIds,
    services: pricedServices,
    vehicleId: appointment.extendedProps.vehicleId,
    startsAt: appointment.startsAt,
    endsAt: appointment.extendedProps.endsAt,
    description: appointment.extendedProps.description,
    discountValue: appointment.extendedProps.discountValue,
  };
}
