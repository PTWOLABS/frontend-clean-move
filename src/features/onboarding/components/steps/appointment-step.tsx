"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { CalendarClock } from "lucide-react";
import { type Control, type FieldValues, useFormContext, useWatch } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Combobox, type ComboboxItemOption } from "@/components/ui/combobox/combobox";
import { FormField } from "@/components/ui/form/field";
import { FormControl } from "@/components/ui/form/form-primitives";
import MultipleSelector, { type Option } from "@/components/ui/multiple-selector";
import { AppointmentDateField } from "@/features/appointments/components/form-sheet/appointment-date-field";
import { useListCustomerOptions } from "@/features/appointments/hooks/queries/use-list-customer-options";
import { useListCustomerVehicleOptions } from "@/features/appointments/hooks/queries/use-list-customer-vehicle-options";
import { useListServiceOptions } from "@/features/appointments/hooks/queries/use-list-service-options";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { cn } from "@/shared/utils/cn";

import type { OnboardingFormValues } from "../../schemas/onboarding-schema";
import { StepHeader } from "./step-header";
import { mergeOptionItems } from "@/shared/utils/multiple-selector-merge-option-items";

type AppointmentStepProps = {
  title: string;
  description: string;
  className?: string;
};

export function AppointmentStep({ title, description, className }: AppointmentStepProps) {
  const { clearErrors, control, setValue } = useFormContext<OnboardingFormValues>();
  const fieldControl = control as unknown as Control<FieldValues>;
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [customerLabel, setCustomerLabel] = useState("");
  const [vehicleLabel, setVehicleLabel] = useState("");
  const [serviceInputValue, setServiceInputValue] = useState("");
  const serviceSearch = useDebouncedValue(serviceInputValue, 500);
  const selectedCustomerId = useWatch({ control, name: "customerId" });
  const selectedVehicleId = useWatch({ control, name: "vehicleId" });
  const selectedServiceIds = useWatch({ control, name: "serviceIds" });

  const selectedCustomerIdValue =
    typeof selectedCustomerId === "string" && selectedCustomerId ? selectedCustomerId : null;

  const { data: customerOptions, isPending: isLoadingCustomerOptions } = useListCustomerOptions({
    limit: 1000,
    search: customerSearch || undefined,
  });

  const { data: vehicleOptions, isPending: isLoadingCustomerVehicleOptions } =
    useListCustomerVehicleOptions({
      customerId: selectedCustomerIdValue ?? undefined,
      limit: 1000,
      search: vehicleSearch || undefined,
    });

  const { data: serviceOptions, isPending: isLoadingServiceOptions } = useListServiceOptions({
    limit: 1000,
    search: serviceSearch || undefined,
  });

  const customerOptionsItems = useMemo(() => {
    return (
      customerOptions?.customers?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? []
    );
  }, [customerOptions]);

  const customerVehicleOptionsItems = useMemo(() => {
    return (
      vehicleOptions?.vehicles?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? []
    );
  }, [vehicleOptions]);

  const serviceOptionsItems = useMemo(() => {
    const options =
      serviceOptions?.services?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? [];

    return mergeOptionItems(options, Array.isArray(selectedServiceIds) ? selectedServiceIds : []);
  }, [selectedServiceIds, serviceOptions]);

  const selectedCustomerLabel = useMemo(() => {
    if (!selectedCustomerIdValue) return "";

    return (
      customerOptionsItems.find((option) => option.value === selectedCustomerIdValue)?.label ?? ""
    );
  }, [customerOptionsItems, selectedCustomerIdValue]);

  const selectedVehicleLabel = useMemo(() => {
    if (typeof selectedVehicleId !== "string" || !selectedVehicleId) return "";

    return (
      customerVehicleOptionsItems.find((option) => option.value === selectedVehicleId)?.label ?? ""
    );
  }, [customerVehicleOptionsItems, selectedVehicleId]);

  const customerComboboxValue = customerLabel || selectedCustomerLabel;
  const vehicleComboboxValue = vehicleLabel || selectedVehicleLabel;

  const handleCardRef = useCallback((node: HTMLDivElement | null) => {
    cardRef.current = node;
    setPortalContainer(node);
  }, []);

  const handleCustomerSelectedItemChange = useCallback(
    (option: ComboboxItemOption | null) => {
      setValue("customerId", option?.value ?? "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: Boolean(option),
      });
      setVehicleSearch("");
      setVehicleLabel("");
      setValue("vehicleId", "", {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
      clearErrors("vehicleId");
    },
    [clearErrors, setValue],
  );

  const handleVehicleSelectedItemChange = useCallback(
    (option: ComboboxItemOption | null) => {
      setValue("vehicleId", option?.value ?? "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: Boolean(option),
      });
    },
    [setValue],
  );

  const getCustomerEmptyMessage = () => {
    if (isLoadingCustomerOptions) return "Buscando clientes...";

    return "Nenhum cliente encontrado.";
  };

  const getVehicleEmptyMessage = () => {
    if (!selectedCustomerIdValue) return "Selecione um cliente primeiro.";
    if (isLoadingCustomerVehicleOptions) return "Buscando veículos...";

    return "Nenhum veículo encontrado.";
  };

  const getServiceEmptyIndicator = () => {
    if (isLoadingServiceOptions) {
      return <p className="px-2 py-1 text-sm text-muted-foreground">Buscando serviços...</p>;
    }

    return <p className="px-2 py-1 text-sm text-muted-foreground">Nenhum serviço encontrado.</p>;
  };

  return (
    <Card
      ref={handleCardRef}
      className={cn("border-border/70 bg-card/60 shadow-sm backdrop-blur-xl", className)}
    >
      <StepHeader title={title} description={description} />

      <CardContent className="space-y-5">
        <FormField
          control={fieldControl}
          name="customerId"
          label="Nome do cliente"
          renderControl={false}
        >
          {({ field }) => (
            <FormControl>
              <Combobox
                ref={field.ref}
                id={field.name}
                name={field.name}
                value={customerComboboxValue}
                onValueChange={setCustomerLabel}
                onDebouncedValueChange={setCustomerSearch}
                onSelectedItemChange={handleCustomerSelectedItemChange}
                onBlur={field.onBlur}
                items={customerOptionsItems}
                portalContainer={cardRef}
                placeholder="Digite o nome do cliente"
                emptyMessage={getCustomerEmptyMessage()}
                autoComplete="name"
                className="h-12 w-full rounded-xl bg-background/60 text-sm shadow-none"
              />
            </FormControl>
          )}
        </FormField>

        <FormField control={fieldControl} name="serviceIds" label="Serviços" renderControl={false}>
          {({ field, fieldState }) => (
            <FormControl>
              <MultipleSelector
                value={Array.isArray(field.value) ? (field.value as Option[]) : []}
                onChange={(options) => {
                  field.onChange(options);
                  setServiceInputValue("");
                }}
                options={serviceOptionsItems}
                portalContainer={portalContainer}
                placeholder="Selecione os serviços"
                emptyIndicator={getServiceEmptyIndicator()}
                className={cn(
                  "min-h-12 w-full rounded-xl border-border/80 bg-background/60 py-2 text-sm shadow-none",
                  fieldState.invalid && "border-destructive/70 focus-within:ring-destructive/30",
                )}
                inputProps={{
                  id: field.name,
                  onBlur: field.onBlur,
                  onValueChange: setServiceInputValue,
                  className: "text-sm",
                }}
                commandProps={{ shouldFilter: false }}
              />
            </FormControl>
          )}
        </FormField>

        <FormField control={fieldControl} name="vehicleId" label="Veículo" renderControl={false}>
          {({ field }) => (
            <FormControl>
              <Combobox
                ref={field.ref}
                id={field.name}
                name={field.name}
                value={vehicleComboboxValue}
                onValueChange={setVehicleLabel}
                onDebouncedValueChange={setVehicleSearch}
                onSelectedItemChange={handleVehicleSelectedItemChange}
                onBlur={field.onBlur}
                items={customerVehicleOptionsItems}
                portalContainer={cardRef}
                placeholder="Digite o nome do veículo"
                emptyMessage={getVehicleEmptyMessage()}
                autoComplete="off"
                disabled={!selectedCustomerIdValue}
                className="h-12 w-full rounded-xl bg-background/60 text-sm shadow-none"
              />
            </FormControl>
          )}
        </FormField>

        <div className="space-y-5">
          <AppointmentDateField
            control={fieldControl}
            name="startsAt"
            label="Data de início"
            portalContainer={portalContainer}
            className="w-full"
            timeInputClassName="w-24 min-[380px]:w-28"
          />

          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            <CalendarClock aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>Se preferir, pule esta etapa e cadastre o primeiro agendamento depois.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
