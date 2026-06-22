import { parseBrlMoneyToReais } from "@/shared/money/format-brl-money";

import {
  createAppointmentFormSchema,
  type CreateAppointmentFormInput,
  type CreateAppointmentFormValues,
  type CreateAppointmentRequestBody,
} from "../schemas/create-appointment-schema";
import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import { hasResourceChanged } from "./appointment-form-values";

export type AppointmentRequestBodyField = keyof CreateAppointmentRequestBody;

type GetChangedRequestBodyOptions = {
  forceFields?: AppointmentRequestBodyField[];
};

type AppointmentResourceResolutionValues = Pick<
  CreateAppointmentFormInput,
  "customerId" | "vehicleId" | "services"
>;

type AppointmentResourceResolutionLabels = {
  customerLabel?: string;
  vehicleLabel?: string;
};

export function buildAppointmentRequestBody(
  values: CreateAppointmentFormValues,
): CreateAppointmentRequestBody {
  return {
    customerId: values.customerId,
    vehicleId: values.vehicleId,
    startsAt: values.startsAt,
    endsAt: values.endsAt,
    description: values.description,
    discountValue: values.discountValue,
    services: values.services.map((service) => ({
      serviceId: service.serviceId,
      priceInCents: Math.round(parseBrlMoneyToReais(service.price) * 100),
    })),
  };
}

export function getComparableRequestBody(values: CreateAppointmentFormInput) {
  const result = createAppointmentFormSchema.safeParse(values);

  return result.success ? buildAppointmentRequestBody(result.data) : null;
}

export function areAppointmentServicesEqual(
  left: CreateAppointmentRequestBody["services"],
  right: CreateAppointmentRequestBody["services"],
) {
  return (
    left.length === right.length &&
    left.every(
      (service, index) =>
        service.serviceId === right[index]?.serviceId &&
        service.priceInCents === right[index]?.priceInCents,
    )
  );
}

export function getChangedRequestBody(
  currentBody: CreateAppointmentRequestBody,
  initialBody: CreateAppointmentRequestBody | null,
  { forceFields = [] }: GetChangedRequestBodyOptions = {},
) {
  if (!initialBody) {
    return currentBody;
  }

  const forcedFieldSet = new Set<AppointmentRequestBodyField>(forceFields);
  const changedBody: Partial<CreateAppointmentRequestBody> = {};

  if (currentBody.customerId !== initialBody.customerId || forcedFieldSet.has("customerId")) {
    changedBody.customerId = currentBody.customerId;
  }

  if (
    !areAppointmentServicesEqual(currentBody.services, initialBody.services) ||
    forcedFieldSet.has("services")
  ) {
    changedBody.services = currentBody.services;
  }

  if (currentBody.vehicleId !== initialBody.vehicleId || forcedFieldSet.has("vehicleId")) {
    changedBody.vehicleId = currentBody.vehicleId;
  }

  if (currentBody.startsAt !== initialBody.startsAt || forcedFieldSet.has("startsAt")) {
    changedBody.startsAt = currentBody.startsAt;
  }

  if (currentBody.endsAt !== initialBody.endsAt || forcedFieldSet.has("endsAt")) {
    changedBody.endsAt = currentBody.endsAt;
  }

  if (currentBody.description !== initialBody.description || forcedFieldSet.has("description")) {
    changedBody.description = currentBody.description;
  }

  if (
    currentBody.discountValue !== initialBody.discountValue ||
    forcedFieldSet.has("discountValue")
  ) {
    changedBody.discountValue = currentBody.discountValue;
  }

  return changedBody;
}

export function getResolvedResourceRequestFields(
  appointment: AppointmentCalendarEvent | null | undefined,
  values: AppointmentResourceResolutionValues,
  labels: AppointmentResourceResolutionLabels = {},
) {
  if (!appointment) {
    return [];
  }

  const fields = new Set<AppointmentRequestBodyField>();
  const customerLabel = labels.customerLabel?.trim();
  const vehicleLabel = labels.vehicleLabel?.trim();
  const snapshotCustomerLabel = appointment.extendedProps.customer.trim();
  const snapshotVehicleLabel = appointment.extendedProps.vehicle.displayName.trim();

  if (
    hasResourceChanged(appointment.extendedProps.customerResourceStatus) &&
    values.customerId === appointment.extendedProps.customerId &&
    customerLabel &&
    customerLabel !== snapshotCustomerLabel
  ) {
    fields.add("customerId");
  }

  if (
    hasResourceChanged(appointment.extendedProps.vehicle.currentResourceStatus) &&
    values.vehicleId === appointment.extendedProps.vehicleId &&
    vehicleLabel &&
    vehicleLabel !== snapshotVehicleLabel
  ) {
    fields.add("vehicleId");
  }

  const changedSnapshotServiceIds = new Set(
    (appointment.extendedProps.services ?? [])
      .filter((service) => hasResourceChanged(service.currentResourceStatus))
      .map((service) => service.serviceId),
  );

  if (
    (values.services ?? []).some(
      (service) =>
        changedSnapshotServiceIds.has(service.serviceId) && service.source !== "snapshot",
    )
  ) {
    fields.add("services");
  }

  return Array.from(fields);
}
