import { useCallback, useMemo, useState } from "react";

import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { DEFAULT_OPTIONS_SIZE } from "@/shared/constants/options";
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
  selectedCustomerFormId?: string | null;
  selectedServiceOptions?: CreateAppointmentFormInput["serviceIds"];
  selectedVehicleFormId?: string | null;
};

type HydrateAppointmentOptionStateParams = {
  customerLabel: string;
  vehicleLabel: string;
  selectedCustomerId: string | null;
};

export function useAppointmentFormOptions({
  appointment,
  selectedCustomerFormId,
  selectedServiceOptions,
  selectedVehicleFormId,
}: UseAppointmentFormOptionsParams) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [customerLabel, setCustomerLabel] = useState("");
  const [vehicleLabel, setVehicleLabel] = useState("");
  const [serviceInputValue, setServiceInputValue] = useState("");
  const serviceSearch = useDebouncedValue(serviceInputValue, 500);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const customerOptionsQuery = useListCustomerOptions({
    size: DEFAULT_OPTIONS_SIZE,
    search: customerSearch || undefined,
  });

  const vehicleOptionsQuery = useListCustomerVehicleOptions({
    customerId: selectedCustomerId ?? undefined,
    size: DEFAULT_OPTIONS_SIZE,
    search: vehicleSearch || undefined,
  });

  const serviceOptionsQuery = useListServiceOptions({
    size: DEFAULT_OPTIONS_SIZE,
    search: serviceSearch || undefined,
  });

  const customerOptionsItems = useMemo(() => {
    const options = customerOptionsQuery.items.map((option) => ({
      label: option.label,
      value: option.id,
    }));
    const shouldKeepSnapshotCustomer =
      appointment?.extendedProps.customerId &&
      selectedCustomerFormId === appointment.extendedProps.customerId;
    const selectedOptions =
      appointment && shouldKeepSnapshotCustomer
        ? [
            {
              label: appointment.extendedProps.customer,
              value: appointment.extendedProps.customerId,
            },
          ]
        : [];

    return mergeOptionItems(options, selectedOptions, {
      preferFetchedOptions: customerSearch.trim().length > 0,
    });
  }, [appointment, customerOptionsQuery.items, customerSearch, selectedCustomerFormId]);

  const customerVehicleOptionsItems = useMemo(() => {
    const options = vehicleOptionsQuery.items.map((option) => ({
      label: option.label,
      value: option.id,
    }));
    const shouldKeepSnapshotVehicle =
      appointment?.extendedProps.vehicleId &&
      selectedCustomerFormId === appointment.extendedProps.customerId &&
      selectedVehicleFormId === appointment.extendedProps.vehicleId;
    const selectedOptions =
      appointment && shouldKeepSnapshotVehicle
        ? [
            {
              label: appointment.extendedProps.vehicle.displayName,
              value: appointment.extendedProps.vehicleId,
            },
          ]
        : [];

    return mergeOptionItems(options, selectedOptions, {
      preferFetchedOptions: vehicleSearch.trim().length > 0,
    });
  }, [
    appointment,
    selectedCustomerFormId,
    selectedVehicleFormId,
    vehicleOptionsQuery.items,
    vehicleSearch,
  ]);

  const serviceOptionsItems = useMemo(() => {
    const options = serviceOptionsQuery.items.map((option) => ({
      label: option.label,
      value: option.id,
    }));

    const hasSelectedServiceOptions =
      Array.isArray(selectedServiceOptions) && selectedServiceOptions.length > 0;

    const selectedServiceValues = new Set(
      (selectedServiceOptions ?? []).map((service) => service.value),
    );
    const selectedSnapshotServiceOptions = (appointment?.extendedProps.serviceIds ?? []).filter(
      (service) => selectedServiceValues.has(service.value),
    );

    return mergeOptionItems(options, selectedSnapshotServiceOptions, {
      preferFetchedOptions: serviceInputValue.trim().length > 0 || !hasSelectedServiceOptions,
    });
  }, [appointment, selectedServiceOptions, serviceInputValue, serviceOptionsQuery.items]);

  const serviceOptionsWithPrice = useMemo<ServiceOptionWithPrice[]>(
    () =>
      serviceOptionsQuery.items.map((option) => {
        const metadata = resolveServicePriceMetadata(option);

        return {
          id: option.id,
          label: option.label,
          ...metadata,
        };
      }),
    [serviceOptionsQuery.items],
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
          priceType: "FIXED",
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

  const clearCustomerAndVehicleSelection = useCallback(() => {
    setCustomerSearch("");
    setCustomerLabel("");
    setSelectedCustomerId(null);
    setVehicleLabel("");
    setVehicleSearch("");
  }, []);

  const clearVehicleSelection = useCallback(() => {
    setVehicleLabel("");
    setVehicleSearch("");
  }, []);

  const clearServiceSearch = useCallback(() => {
    setServiceInputValue("");
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

  const customerEmptyMessage = customerOptionsQuery.isPending
    ? "Buscando clientes..."
    : "Nenhum cliente encontrado.";
  const vehicleEmptyMessage = !selectedCustomerId
    ? "Selecione um cliente primeiro."
    : vehicleOptionsQuery.isPending
      ? "Buscando veículos..."
      : "Nenhum veículo encontrado.";
  const serviceEmptyMessage = serviceOptionsQuery.isPending
    ? "Buscando serviços..."
    : "Nenhum serviço encontrado.";

  return {
    clearCustomerAndVehicleSelection,
    clearServiceSearch,
    clearVehicleSelection,
    customerEmptyMessage,
    customerHasMore: customerOptionsQuery.hasMore,
    customerIsFetchingNextPage: customerOptionsQuery.isFetchingNextPage,
    customerFetchNextPage: customerOptionsQuery.fetchNextPage,
    customerLabel,
    customerOptionsItems,
    customerVehicleOptionsItems,
    hydrateOptionState,
    resetOptionState,
    selectedCustomerId,
    serviceEmptyMessage,
    serviceFetchNextPage: serviceOptionsQuery.fetchNextPage,
    serviceHasMore: serviceOptionsQuery.hasMore,
    serviceInputValue,
    serviceIsFetchingNextPage: serviceOptionsQuery.isFetchingNextPage,
    serviceOptionsItems,
    servicePriceById,
    setCustomerLabel,
    setCustomerSearch,
    setSelectedCustomerId,
    setServiceInputValue,
    setVehicleLabel,
    setVehicleSearch,
    vehicleEmptyMessage,
    vehicleFetchNextPage: vehicleOptionsQuery.fetchNextPage,
    vehicleHasMore: vehicleOptionsQuery.hasMore,
    vehicleIsFetchingNextPage: vehicleOptionsQuery.isFetchingNextPage,
    vehicleLabel,
  };
}
