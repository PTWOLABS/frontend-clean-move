import { useCallback, useEffect } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";

import type { Option } from "@/components/ui/multiple-selector";
import { formatServicePriceMetadataDescription } from "@/shared/services/service-price-metadata";

import { formatCentsToBrlInput, type ServiceOptionWithPrice } from "../lib/appointment-form-values";
import type { CreateAppointmentFormInput } from "../schemas/create-appointment-schema";

type AppointmentFormService = NonNullable<CreateAppointmentFormInput["services"]>[number];

type UseAppointmentFormServicesParams = {
  clearServiceSearch: () => void;
  getValues: UseFormGetValues<CreateAppointmentFormInput>;
  isEditing: boolean;
  open: boolean;
  servicePriceById: Map<string, ServiceOptionWithPrice>;
  setValue: UseFormSetValue<CreateAppointmentFormInput>;
};

function buildServicesFromSelectedOptions(
  options: Option[],
  currentServices: AppointmentFormService[],
  servicePriceById: Map<string, ServiceOptionWithPrice>,
): AppointmentFormService[] {
  return options.map((option) => {
    const existing = currentServices.find((service) => service.serviceId === option.value);

    if (existing) {
      return {
        ...existing,
        serviceLabel: option.label,
      };
    }

    const metadata = servicePriceById.get(option.value);
    const priceType = metadata?.priceType ?? "STARTING_AT";
    const minPriceInCents = metadata?.minPriceInCents ?? 0;

    return {
      serviceId: option.value,
      serviceLabel: option.label,
      source: "catalog",
      priceType,
      minPriceInCents,
      maxPriceInCents: metadata?.maxPriceInCents,
      price: formatCentsToBrlInput(minPriceInCents),
    };
  });
}

export function useAppointmentFormServices({
  clearServiceSearch,
  getValues,
  isEditing,
  open,
  servicePriceById,
  setValue,
}: UseAppointmentFormServicesParams) {
  const getServicePriceDescription = useCallback((service: AppointmentFormService) => {
    if (service.source === "snapshot") {
      return `Valor registrado: ${service.price}`;
    }

    return formatServicePriceMetadataDescription(service);
  }, []);

  const handleServiceOptionsChange = useCallback(
    (options: Option[], onChange: (options: Option[]) => void) => {
      onChange(options);

      const currentServices = getValues("services") ?? [];
      const nextServices = buildServicesFromSelectedOptions(
        options,
        currentServices,
        servicePriceById,
      );

      setValue("services", nextServices, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      clearServiceSearch();
    },
    [clearServiceSearch, getValues, servicePriceById, setValue],
  );

  useEffect(() => {
    if (!open || !isEditing || servicePriceById.size === 0) return;

    const currentServices = getValues("services") ?? [];
    if (currentServices.length === 0) return;

    let hasChanges = false;
    const nextServices = currentServices.map((service) => {
      if (service.source === "snapshot") {
        return service;
      }

      const metadata = servicePriceById.get(service.serviceId);
      if (!metadata) return service;

      if (
        service.priceType === metadata.priceType &&
        service.minPriceInCents === metadata.minPriceInCents &&
        service.maxPriceInCents === metadata.maxPriceInCents
      ) {
        return service;
      }

      hasChanges = true;
      return {
        ...service,
        priceType: metadata.priceType,
        minPriceInCents: metadata.minPriceInCents,
        maxPriceInCents: metadata.maxPriceInCents,
        price:
          metadata.priceType === "FIXED"
            ? formatCentsToBrlInput(metadata.minPriceInCents)
            : service.price,
      };
    });

    if (hasChanges) {
      setValue("services", nextServices, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
    }
  }, [getValues, isEditing, open, servicePriceById, setValue]);

  return {
    getServicePriceDescription,
    handleServiceOptionsChange,
  };
}
