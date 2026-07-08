"use client";

import { useCallback, useMemo, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import type { ComboboxItemOption } from "@/components/ui/combobox/combobox";
import { useListServiceOptions } from "@/features/appointments/hooks/queries/use-list-service-options";
import { DEFAULT_OPTIONS_LIMIT } from "@/shared/constants/options";
import {
  resolveServicePriceMetadata,
  type ServicePriceMetadata,
} from "@/shared/services/service-price-metadata";

import type { CreateQuoteFormInput } from "../types/create-quote";

export function useQuoteServicesStep() {
  const { clearErrors, control, setValue } = useFormContext<CreateQuoteFormInput>();
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceLabel, setServiceLabel] = useState("");
  const [selectedService, setSelectedService] = useState<ComboboxItemOption | null>(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "stepTwo.services",
  });

  const services = useWatch({ control, name: "stepTwo.services" }) ?? [];
  const { data: serviceOptions, isPending: isLoadingServiceOptions } = useListServiceOptions({
    limit: DEFAULT_OPTIONS_LIMIT,
    search: serviceSearch || undefined,
  });

  const serviceOptionsItems = useMemo(
    () =>
      serviceOptions?.services?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? [],
    [serviceOptions],
  );

  const servicePriceMetadataById = useMemo(() => {
    const priceMetadataById = new Map<string, ServicePriceMetadata>();

    serviceOptions?.services?.forEach((option) => {
      const metadata = resolveServicePriceMetadata(option);
      priceMetadataById.set(option.id, metadata);
    });

    return priceMetadataById;
  }, [serviceOptions]);

  const hasSelectedServiceInList = services.some(
    (service) => service.serviceId === selectedService?.value,
  );

  const addSelectedService = useCallback(() => {
    if (!selectedService || hasSelectedServiceInList) return;

    const priceMetadata = servicePriceMetadataById.get(selectedService.value);

    append({
      serviceId: selectedService.value,
      serviceLabel: selectedService.label,
      priceInCents: priceMetadata?.minPriceInCents ?? 0,
      priceType: priceMetadata?.priceType,
      minPriceInCents: priceMetadata?.minPriceInCents,
      maxPriceInCents: priceMetadata?.maxPriceInCents,
      isCourtesy: false,
    });

    setSelectedService(null);
    setServiceLabel("");
    setServiceSearch("");
    clearErrors("stepTwo.services");
  }, [append, clearErrors, hasSelectedServiceInList, selectedService, servicePriceMetadataById]);

  const addManualService = useCallback(() => {
    append({
      serviceName: "",
      priceInCents: undefined,
      isCourtesy: false,
    });
    clearErrors("stepTwo.services");
  }, [append, clearErrors]);

  const handleServiceSelectedItemChange = useCallback((option: ComboboxItemOption | null) => {
    setSelectedService(option);
  }, []);

  const handleCourtesyChange = useCallback(
    (index: number, checked: boolean) => {
      setValue(`stepTwo.services.${index}.isCourtesy`, checked, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const removeService = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove],
  );

  const totalInCents = services.reduce((total, service) => {
    if (service.isCourtesy) return total;
    const priceInCents =
      typeof service.priceInCents === "number" && Number.isFinite(service.priceInCents)
        ? service.priceInCents
        : 0;

    return total + priceInCents;
  }, 0);

  const serviceRows = fields.map((field, index) => ({
    fieldId: field.id,
    index,
    service: services[index],
  }));

  const serviceEmptyMessage = isLoadingServiceOptions
    ? "Buscando servicos..."
    : "Nenhum servico encontrado.";

  return {
    addManualService,
    addSelectedService,
    canAddSelectedService: Boolean(selectedService) && !hasSelectedServiceInList,
    control,
    handleCourtesyChange,
    handleServiceSelectedItemChange,
    hasSelectedServiceInList,
    removeService,
    serviceEmptyMessage,
    serviceLabel,
    serviceOptionsItems,
    serviceRows,
    services,
    setServiceLabel,
    setServiceSearch,
    totalInCents,
  };
}
