"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import type { ComboboxItemOption } from "@/components/ui/combobox/combobox";
import { useListCustomerOptions } from "@/features/appointments/hooks/queries/use-list-customer-options";
import { useListCustomerVehicleOptions } from "@/features/appointments/hooks/queries/use-list-customer-vehicle-options";
import { useCustomer } from "@/features/customer/hooks/use-customer";
import { useVehicle } from "@/features/vehicle/hooks/use-vehicle";
import { DEFAULT_OPTIONS_LIMIT } from "@/shared/constants/options";

import { createQuoteFormDefaultValues } from "../schemas/create-quote-schema";
import type { CreateQuoteFormInput } from "../types/create-quote";

export function useQuoteCustomerVehicleStep() {
  const { control, clearErrors, resetField, setValue, trigger } =
    useFormContext<CreateQuoteFormInput>();
  const selectedCustomerId = useWatch({ control, name: "stepOne.customerId" });
  const selectedCustomerName = useWatch({ control, name: "stepOne.customer.name" });
  const selectedVehicleId = useWatch({ control, name: "stepOne.vehicleId" });
  const selectedVehicleLabel = useWatch({ control, name: "stepOne.vehicleLabel" });
  const [customerSearch, setCustomerSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [customerLabel, setCustomerLabel] = useState("");
  const [vehicleLabel, setVehicleLabel] = useState("");

  const hasSelectedCustomer = Boolean(selectedCustomerId);
  const hasSelectedVehicle = Boolean(selectedVehicleId);
  const selectedCustomerDisplayLabel = selectedCustomerName?.trim() ?? "";
  const selectedVehicleDisplayLabel =
    typeof selectedVehicleLabel === "string" ? selectedVehicleLabel.trim() : "";
  const customerComboboxValue = hasSelectedCustomer ? selectedCustomerDisplayLabel : customerLabel;
  const vehicleComboboxValue = hasSelectedVehicle ? selectedVehicleDisplayLabel : vehicleLabel;

  const { data: customerOptions, isPending: isLoadingCustomerOptions } = useListCustomerOptions({
    limit: DEFAULT_OPTIONS_LIMIT,
    search: customerSearch || undefined,
  });

  const { data: selectedCustomer, isFetching: isFetchingSelectedCustomer } = useCustomer({
    customerId: selectedCustomerId,
    enabled: hasSelectedCustomer,
  });

  const { data: vehicleOptions, isPending: isLoadingCustomerVehicleOptions } =
    useListCustomerVehicleOptions({
      customerId: selectedCustomerId ?? undefined,
      limit: DEFAULT_OPTIONS_LIMIT,
      search: vehicleSearch || undefined,
    });

  const { data: selectedVehicle, isFetching: isFetchingSelectedVehicle } = useVehicle({
    customerId: selectedCustomerId,
    vehicleId: selectedVehicleId,
    enabled: hasSelectedCustomer && hasSelectedVehicle,
  });

  const customerOptionsItems = useMemo(
    () =>
      customerOptions?.customers?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? [],
    [customerOptions],
  );

  const vehicleOptionsItems = useMemo(
    () =>
      vehicleOptions?.vehicles?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? [],
    [vehicleOptions],
  );

  const clearVehicleSelection = useCallback(() => {
    setValue("stepOne.vehicleId", null, { shouldDirty: true, shouldValidate: true });
    setValue("stepOne.vehicleLabel", null, { shouldDirty: true });
    setValue("stepOne.vehicle.plate", null, { shouldDirty: true });
    setValue("stepOne.vehicle.brand", null, { shouldDirty: true });
    setValue("stepOne.vehicle.model", null, { shouldDirty: true });
    setValue("stepOne.vehicle.color", null, { shouldDirty: true });
    setValue("stepOne.vehicle.year", null, { shouldDirty: true });
    setVehicleLabel("");
    setVehicleSearch("");
  }, [setValue]);

  const clearCustomerSelection = useCallback(() => {
    resetField("stepOne", {
      defaultValue: createQuoteFormDefaultValues.stepOne,
    });
    setCustomerLabel("");
    setCustomerSearch("");
    setVehicleLabel("");
    setVehicleSearch("");
  }, [resetField]);

  const handleCustomerSelectedItemChange = useCallback(
    (option: ComboboxItemOption | null) => {
      if (!option) {
        if (selectedCustomerId) {
          clearCustomerSelection();
        }
        return;
      }

      setValue("stepOne.customerId", option.value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("stepOne.customer.name", option.label, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("stepOne.customer.phone", null, { shouldDirty: true });
      setValue("stepOne.customer.email", null, { shouldDirty: true });
      setValue("stepOne.customer.cpfCnpj", null, { shouldDirty: true });
      clearVehicleSelection();
      clearErrors("stepOne.customer");
      void trigger("stepOne.customer");
    },
    [
      clearCustomerSelection,
      clearErrors,
      clearVehicleSelection,
      selectedCustomerId,
      setValue,
      trigger,
    ],
  );

  const handleVehicleSelectedItemChange = useCallback(
    (option: ComboboxItemOption | null) => {
      if (!option) {
        if (selectedVehicleId) {
          clearVehicleSelection();
        }
        return;
      }

      setValue("stepOne.vehicleId", option.value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("stepOne.vehicleLabel", option.label, {
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors("stepOne.vehicle");
      void trigger("stepOne");
    },
    [clearErrors, clearVehicleSelection, selectedVehicleId, setValue, trigger],
  );

  useEffect(() => {
    if (!selectedCustomer || selectedCustomer.id !== selectedCustomerId) return;

    setValue("stepOne.customer.name", selectedCustomer.fullName, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("stepOne.customer.phone", selectedCustomer.phone ?? null, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("stepOne.customer.email", selectedCustomer.email ?? null, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("stepOne.customer.cpfCnpj", selectedCustomer.cpfCnpj ?? null, {
      shouldDirty: true,
      shouldValidate: true,
    });
    void trigger("stepOne.customer");
  }, [selectedCustomer, selectedCustomerId, setValue, trigger]);

  useEffect(() => {
    if (
      !selectedVehicle ||
      selectedVehicle.id !== selectedVehicleId ||
      selectedVehicle.customerId !== selectedCustomerId
    ) {
      return;
    }

    setValue("stepOne.vehicle.plate", selectedVehicle.plate ?? null, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("stepOne.vehicle.brand", selectedVehicle.brand ?? null, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("stepOne.vehicle.model", selectedVehicle.model ?? null, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("stepOne.vehicle.color", selectedVehicle.color ?? null, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("stepOne.vehicle.year", selectedVehicle.year ?? null, {
      shouldDirty: true,
      shouldValidate: true,
    });
    clearErrors("stepOne.vehicle");
    void trigger("stepOne");
  }, [clearErrors, selectedCustomerId, selectedVehicle, selectedVehicleId, setValue, trigger]);

  const customerEmptyMessage = isLoadingCustomerOptions
    ? "Buscando clientes..."
    : "Nenhum cliente encontrado.";
  const vehicleEmptyMessage = !selectedCustomerId
    ? "Selecione um cliente primeiro."
    : isLoadingCustomerVehicleOptions
      ? "Buscando veículos..."
      : "Nenhum veículo encontrado.";

  return {
    control,
    customerEmptyMessage,
    customerLabel: customerComboboxValue,
    customerOptionsItems,
    handleCustomerSelectedItemChange,
    handleVehicleSelectedItemChange,
    hasSelectedCustomer,
    hasSelectedVehicle,
    isFetchingSelectedCustomer,
    isFetchingSelectedVehicle,
    selectedCustomerId,
    setCustomerLabel,
    setCustomerSearch,
    setVehicleLabel,
    setVehicleSearch,
    vehicleEmptyMessage,
    vehicleLabel: vehicleComboboxValue,
    vehicleOptionsItems,
  };
}
