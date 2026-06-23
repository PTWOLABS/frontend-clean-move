import { useCallback, useMemo } from "react";

import {
  useWatch,
  type Control,
  type UseFormGetValues,
  type UseFormSetValue,
} from "react-hook-form";

import { hasResourceChanged } from "../lib/appointment-form-values";
import type {
  CreateAppointmentFormInput,
  CreateAppointmentFormValues,
} from "../schemas/create-appointment-schema";
import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import type { ResourceStatus } from "../types/appointments-dto";

type AppointmentFormServiceResource = {
  serviceId: string;
  source?: "snapshot" | "catalog";
};

type UseAppointmentFormResourceStatusParams = {
  appointment?: AppointmentCalendarEvent | null;
  clearCustomerAndVehicleSelection: () => void;
  clearServiceSearch: () => void;
  clearVehicleSelection: () => void;
  control: Control<CreateAppointmentFormInput, undefined, CreateAppointmentFormValues>;
  getValues: UseFormGetValues<CreateAppointmentFormInput>;
  selectedServices?: AppointmentFormServiceResource[];
  setValue: UseFormSetValue<CreateAppointmentFormInput>;
};

export function useAppointmentFormResourceStatus({
  appointment,
  clearCustomerAndVehicleSelection,
  clearServiceSearch,
  clearVehicleSelection,
  control,
  getValues,
  selectedServices,
  setValue,
}: UseAppointmentFormResourceStatusParams) {
  const selectedCustomerFormId = useWatch({
    control,
    name: "customerId",
  });
  const selectedVehicleFormId = useWatch({
    control,
    name: "vehicleId",
  });

  const customerResourceStatus: ResourceStatus | undefined =
    appointment?.extendedProps.customerResourceStatus === "DELETED" &&
    selectedCustomerFormId === appointment.extendedProps.customerId
      ? "DELETED"
      : undefined;
  const vehicleResourceStatus: ResourceStatus | undefined =
    appointment?.extendedProps.vehicle.currentResourceStatus === "DELETED" &&
    selectedVehicleFormId === appointment.extendedProps.vehicleId
      ? "DELETED"
      : undefined;

  const serviceResourceStatusById = useMemo(() => {
    const map = new Map<string, ResourceStatus>();

    for (const service of appointment?.extendedProps.services ?? []) {
      if (hasResourceChanged(service.currentResourceStatus)) {
        map.set(service.serviceId, service.currentResourceStatus);
      }
    }

    return map;
  }, [appointment]);

  const getServiceResourceStatus = useCallback(
    (service: AppointmentFormServiceResource) => {
      if (service.source !== "snapshot") {
        return undefined;
      }

      return serviceResourceStatusById.get(service.serviceId);
    },
    [serviceResourceStatusById],
  );

  const hasLockedSnapshotService = useMemo(
    () => selectedServices?.some((service) => Boolean(getServiceResourceStatus(service))) ?? false,
    [getServiceResourceStatus, selectedServices],
  );

  const handleRemoveService = useCallback(
    (serviceId: string) => {
      const nextServiceIds = (getValues("serviceIds") ?? []).filter(
        (service) => service.value !== serviceId,
      );
      const nextServices = (getValues("services") ?? []).filter(
        (service) => service.serviceId !== serviceId,
      );

      setValue("serviceIds", nextServiceIds, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("services", nextServices, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      clearServiceSearch();
    },
    [clearServiceSearch, getValues, setValue],
  );

  const handleRemoveCustomer = useCallback(() => {
    clearCustomerAndVehicleSelection();
    setValue("customerId", "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue("vehicleId", "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [clearCustomerAndVehicleSelection, setValue]);

  const handleRemoveVehicle = useCallback(() => {
    clearVehicleSelection();
    setValue("vehicleId", "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [clearVehicleSelection, setValue]);

  return {
    customerResourceStatus,
    getServiceResourceStatus,
    handleRemoveCustomer,
    handleRemoveService,
    handleRemoveVehicle,
    hasLockedSnapshotService,
    vehicleResourceStatus,
  };
}
