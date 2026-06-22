import { useCallback, useMemo, useState } from "react";

import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { mergeOptionItems } from "@/shared/utils/multiple-selector-merge-option-items";

import {
  resolveServicePriceMetadata,
  type ServiceOptionWithPrice,
} from "../lib/appointment-form-values";
import type { CreateAppointmentFormInput } from "../schemas/create-appointment-schema";
import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import { useListCustomerOptions } from "./queries/use-list-customer-options";
import { useListCustomerVehicleOptions } from "./queries/use-list-customer-vehicle-options";
import { useListServiceOptions } from "./queries/use-list-service-options";

type UseAppointmentFormOptionsParams = {
  appointment?: AppointmentCalendarEvent | null;
  selectedServiceOptions?: CreateAppointmentFormInput["serviceIds"];
};

type HydrateAppointmentOptionStateParams = {
  customerLabel: string;
  vehicleLabel: string;
  selectedCustomerId: string | null;
};

export function useAppointmentFormOptions({
  appointment,
  selectedServiceOptions,
}: UseAppointmentFormOptionsParams) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [customerLabel, setCustomerLabel] = useState("");
  const [vehicleLabel, setVehicleLabel] = useState("");
  const [serviceInputValue, setServiceInputValue] = useState("");
  const serviceSearch = useDebouncedValue(serviceInputValue, 500);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data: customerOptions, isPending: isLoadingCustomerOptions } = useListCustomerOptions({
    limit: 1000,
    search: customerSearch || undefined,
  });

  const { data: vehicleOptions, isPending: isLoadingCustomerVehicleOptions } =
    useListCustomerVehicleOptions({
      customerId: selectedCustomerId ?? undefined,
      limit: 1000,
      search: vehicleSearch || undefined,
    });

  const { data: serviceOptions, isPending: isLoadingServiceOptions } = useListServiceOptions({
    limit: 1000,
    search: serviceSearch || undefined,
  });

  const customerOptionsItems = useMemo(() => {
    const options =
      customerOptions?.customers?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? [];
    const selectedOptions =
      appointment && appointment.extendedProps.customerId
        ? [
            {
              label: appointment.extendedProps.customer,
              value: appointment.extendedProps.customerId,
            },
          ]
        : [];

    return mergeOptionItems(options, selectedOptions);
  }, [appointment, customerOptions]);

  const customerVehicleOptionsItems = useMemo(() => {
    const options =
      vehicleOptions?.vehicles?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? [];
    const selectedOptions =
      appointment && appointment.extendedProps.vehicleId
        ? [
            {
              label: appointment.extendedProps.vehicle.displayName,
              value: appointment.extendedProps.vehicleId,
            },
          ]
        : [];

    return mergeOptionItems(options, selectedOptions);
  }, [appointment, vehicleOptions]);

  const serviceOptionsItems = useMemo(() => {
    const options =
      serviceOptions?.services?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? [];

    const hasSelectedServiceOptions =
      Array.isArray(selectedServiceOptions) && selectedServiceOptions.length > 0;

    return mergeOptionItems(options, appointment?.extendedProps.serviceIds ?? [], {
      preferFetchedOptions: serviceInputValue.trim().length > 0 || !hasSelectedServiceOptions,
    });
  }, [appointment, selectedServiceOptions, serviceInputValue, serviceOptions]);

  const serviceOptionsWithPrice = useMemo<ServiceOptionWithPrice[]>(
    () =>
      serviceOptions?.services?.map((option) => {
        const metadata = resolveServicePriceMetadata(option);

        return {
          id: option.id,
          label: option.label,
          ...metadata,
        };
      }) ?? [],
    [serviceOptions],
  );

  const servicePriceById = useMemo(() => {
    const map = new Map<string, ServiceOptionWithPrice>();
    for (const option of serviceOptionsWithPrice) {
      map.set(option.id, option);
    }
    for (const service of appointment?.extendedProps.services ?? []) {
      if (!map.has(service.serviceId)) {
        map.set(service.serviceId, {
          id: service.serviceId,
          label: service.label,
          priceType: "STARTING_AT",
          minPriceInCents: service.priceInCents,
        });
      }
    }
    return map;
  }, [appointment, serviceOptionsWithPrice]);

  const resetOptionState = useCallback(() => {
    setCustomerSearch("");
    setCustomerLabel("");
    setVehicleLabel("");
    setServiceInputValue("");
    setVehicleSearch("");
    setSelectedCustomerId(null);
  }, []);

  const hydrateOptionState = useCallback(
    ({ customerLabel, selectedCustomerId, vehicleLabel }: HydrateAppointmentOptionStateParams) => {
      setCustomerSearch("");
      setCustomerLabel(customerLabel);
      setVehicleSearch("");
      setVehicleLabel(vehicleLabel);
      setServiceInputValue("");
      setSelectedCustomerId(selectedCustomerId);
    },
    [],
  );

  const customerEmptyMessage = isLoadingCustomerOptions
    ? "Buscando clientes..."
    : "Nenhum cliente encontrado.";
  const vehicleEmptyMessage = !selectedCustomerId
    ? "Selecione um cliente primeiro."
    : isLoadingCustomerVehicleOptions
      ? "Buscando veículos..."
      : "Nenhum veículo encontrado.";
  const serviceEmptyMessage = isLoadingServiceOptions
    ? "Buscando serviços..."
    : "Nenhum serviço encontrado.";

  return {
    customerEmptyMessage,
    customerLabel,
    customerOptionsItems,
    customerVehicleOptionsItems,
    hydrateOptionState,
    resetOptionState,
    selectedCustomerId,
    serviceEmptyMessage,
    serviceInputValue,
    serviceOptions,
    serviceOptionsItems,
    servicePriceById,
    setCustomerLabel,
    setCustomerSearch,
    setSelectedCustomerId,
    setServiceInputValue,
    setVehicleLabel,
    setVehicleSearch,
    vehicleEmptyMessage,
    vehicleLabel,
  };
}
