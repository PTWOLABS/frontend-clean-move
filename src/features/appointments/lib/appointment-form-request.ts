import { parseBrlMoneyToReais } from "@/shared/money/format-brl-money";

import {
  createAppointmentFormSchema,
  type CreateAppointmentFormInput,
  type CreateAppointmentFormValues,
  type CreateAppointmentRequestBody,
} from "../schemas/create-appointment-schema";

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
) {
  if (!initialBody) {
    return currentBody;
  }

  const changedBody: Partial<CreateAppointmentRequestBody> = {};

  if (currentBody.customerId !== initialBody.customerId) {
    changedBody.customerId = currentBody.customerId;
  }

  if (!areAppointmentServicesEqual(currentBody.services, initialBody.services)) {
    changedBody.services = currentBody.services;
  }

  if (currentBody.vehicleId !== initialBody.vehicleId) {
    changedBody.vehicleId = currentBody.vehicleId;
  }

  if (currentBody.startsAt !== initialBody.startsAt) {
    changedBody.startsAt = currentBody.startsAt;
  }

  if (currentBody.endsAt !== initialBody.endsAt) {
    changedBody.endsAt = currentBody.endsAt;
  }

  if (currentBody.description !== initialBody.description) {
    changedBody.description = currentBody.description;
  }

  if (currentBody.discountValue !== initialBody.discountValue) {
    changedBody.discountValue = currentBody.discountValue;
  }

  return changedBody;
}
