"use client";

import { useCallback, useMemo, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import type { ComboboxItemOption } from "@/components/ui/combobox/combobox";
import { useListServiceOptions } from "@/features/appointments/hooks/queries/use-list-service-options";
import { resolveServicePriceMetadata } from "@/features/appointments/lib/appointment-form-values";
import { DEFAULT_OPTIONS_LIMIT } from "@/shared/constants/options";

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

  const servicePriceById = useMemo(() => {
    const priceById = new Map<string, number>();

    serviceOptions?.services?.forEach((option) => {
      const metadata = resolveServicePriceMetadata(option);
      priceById.set(option.id, metadata.minPriceInCents);
    });

    return priceById;
  }, [serviceOptions]);

  const hasSelectedServiceInList = services.some(
    (service) => service.serviceId === selectedService?.value,
  );

  const addSelectedService = useCallback(() => {
    if (!selectedService || hasSelectedServiceInList) return;

    append({
      serviceId: selectedService.value,
      serviceLabel: selectedService.label,
      priceInCents: servicePriceById.get(selectedService.value) ?? 0,
      isCourtesy: false,
    });

    setSelectedService(null);
    setServiceLabel("");
    setServiceSearch("");
    clearErrors("stepTwo.services");
  }, [append, clearErrors, hasSelectedServiceInList, selectedService, servicePriceById]);

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

      if (checked) {
        setValue(`stepTwo.services.${index}.priceInCents`, 0, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    },
    [setValue],
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
    removeService: remove,
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
