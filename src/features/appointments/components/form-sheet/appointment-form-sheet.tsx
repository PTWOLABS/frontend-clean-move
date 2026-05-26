"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  type Control,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxItemOption } from "@/components/ui/combobox/combobox";
import { FormField } from "@/components/ui/form/field";
import { FormControl, FormDescription } from "@/components/ui/form/form-primitives";
import { Input } from "@/components/ui/input";
import MultipleSelector, { type Option } from "@/components/ui/multiple-selector";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { cn } from "@/shared/utils/cn";
import { handleNumericInputChange } from "@/shared/utils/lib";

import {
  createAppointmentDefaultValues,
  createAppointmentFormSchema,
  type CreateAppointmentFormInput,
  type CreateAppointmentFormValues,
} from "../../schemas/create-appointment-schema";
import { AppointmentDateField } from "./appointment-date-field";
import { useListCustomerOptions } from "../../hooks/queries/use-list-customer-options";
import { useListCustomerVehicleOptions } from "../../hooks/queries/use-list-customer-vehicle-options";
import { useListServiceOptions } from "../../hooks/queries/use-list-service-options";

type AppointmentFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AppointmentFormSheet({ open, onOpenChange }: AppointmentFormSheetProps) {
  const methods = useForm<CreateAppointmentFormInput, undefined, CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentFormSchema) as Resolver<
      CreateAppointmentFormInput,
      undefined,
      CreateAppointmentFormValues
    >,
    defaultValues: createAppointmentDefaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { control, handleSubmit, reset, setValue } = methods;
  const fieldControl = control as unknown as Control<FieldValues>;
  const sheetContentRef = useRef<HTMLDivElement | null>(null);
  const [sheetContentElement, setSheetContentElement] = useState<HTMLDivElement | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [serviceInputValue, setServiceInputValue] = useState("");
  const serviceSearch = useDebouncedValue(serviceInputValue, 500);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    reset(createAppointmentDefaultValues);
  }, [open, reset]);

  const { data: customerOptions, isPending: isLoadingCustomerOptions } = useListCustomerOptions({
    limit: 5,
    search: customerSearch || undefined,
  });

  const { data: vehicleOptions, isPending: isLoadingCustomerVehicleOptions } =
    useListCustomerVehicleOptions({
      customerId: selectedCustomerId ?? undefined,
      limit: 5,
      search: vehicleSearch || undefined,
    });

  const { data: serviceOptions, isPending: isLoadingServiceOptions } = useListServiceOptions({
    limit: 5,
    search: serviceSearch || undefined,
  });

  const customerOptionsItems = useMemo(
    () =>
      customerOptions?.customers?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? [],
    [customerOptions],
  );

  const customerVehicleOptionsItems = useMemo(
    () =>
      vehicleOptions?.vehicles?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? [],
    [vehicleOptions],
  );

  const handleCustomerSelectedItemChange = useCallback(
    (option: ComboboxItemOption | null) => {
      setSelectedCustomerId(option?.value ?? null);
      setVehicleSearch("");
      setValue("vehicleName", "", {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    },
    [setValue],
  );

  const resetOptionState = useCallback(() => {
    setCustomerSearch("");
    setServiceInputValue("");
    setVehicleSearch("");
    setSelectedCustomerId(null);
  }, []);

  const handleSheetOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetOptionState();
      }

      onOpenChange(nextOpen);
    },
    [onOpenChange, resetOptionState],
  );

  const handleSheetContentRef = useCallback((node: HTMLDivElement | null) => {
    sheetContentRef.current = node;
    setSheetContentElement(node);
  }, []);

  const getCustomerEmptyMessage = () => {
    if (isLoadingCustomerOptions) return "Buscando clientes...";

    return "Nenhum cliente encontrado.";
  };

  const getVehicleEmptyMessage = () => {
    if (!selectedCustomerId) return "Selecione um cliente primeiro.";
    if (isLoadingCustomerVehicleOptions) return "Buscando veículos...";

    return "Nenhum veículo encontrado.";
  };

  const serviceOptionsItems = useMemo(
    () =>
      serviceOptions?.services?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? [],
    [serviceOptions],
  );

  const getServiceEmptyIndicator = () => {
    if (isLoadingServiceOptions) {
      return <p className="px-2 py-1 text-sm text-muted-foreground">Buscando serviços...</p>;
    }

    return <p className="px-2 py-1 text-sm text-muted-foreground">Nenhum serviço encontrado.</p>;
  };

  const onSubmit = (values: CreateAppointmentFormValues) => {
    void values;
    toast.info("Dados do agendamento validados. Integração de criação pendente.");
  };

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        ref={handleSheetContentRef}
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Novo agendamento</SheetTitle>
          <SheetDescription>Preencha os dados para criar um novo agendamento.</SheetDescription>
        </SheetHeader>

        <FormProvider {...methods}>
          <form className="flex flex-1 flex-col gap-6 py-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              <FormField
                control={fieldControl}
                name="customerName"
                label="Nome do cliente"
                required
                renderControl={false}
              >
                {({ field }) => (
                  <FormControl>
                    <Combobox
                      ref={field.ref}
                      id={field.name}
                      name={field.name}
                      value={typeof field.value === "string" ? field.value : ""}
                      onValueChange={field.onChange}
                      onDebouncedValueChange={setCustomerSearch}
                      onSelectedItemChange={handleCustomerSelectedItemChange}
                      onBlur={field.onBlur}
                      items={customerOptionsItems}
                      portalContainer={sheetContentRef}
                      placeholder="Digite o nome do cliente"
                      emptyMessage={getCustomerEmptyMessage()}
                      autoComplete="name"
                      required
                    />
                  </FormControl>
                )}
              </FormField>

              <FormField
                control={fieldControl}
                name="serviceIds"
                label="Serviços"
                required
                renderControl={false}
              >
                {({ field, fieldState }) => (
                  <FormControl>
                    <MultipleSelector
                      value={Array.isArray(field.value) ? (field.value as Option[]) : []}
                      onChange={(options) => {
                        field.onChange(options);
                        setServiceInputValue("");
                      }}
                      options={serviceOptionsItems}
                      placeholder="Selecione os serviços"
                      emptyIndicator={getServiceEmptyIndicator()}
                      className={cn(
                        "min-h-10 border-border/80 bg-background/40 py-2 shadow-sm",
                        fieldState.invalid &&
                          "border-destructive/70 focus-within:ring-destructive/30",
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

              <FormField
                control={fieldControl}
                name="vehicleName"
                label="Veículo"
                required
                renderControl={false}
              >
                {({ field }) => (
                  <FormControl>
                    <Combobox
                      ref={field.ref}
                      id={field.name}
                      name={field.name}
                      value={typeof field.value === "string" ? field.value : ""}
                      onValueChange={field.onChange}
                      onDebouncedValueChange={setVehicleSearch}
                      onBlur={field.onBlur}
                      items={customerVehicleOptionsItems}
                      portalContainer={sheetContentRef}
                      placeholder="Digite o nome do veículo"
                      emptyMessage={getVehicleEmptyMessage()}
                      autoComplete="off"
                      disabled={!selectedCustomerId}
                      required
                    />
                  </FormControl>
                )}
              </FormField>

              <div className="grid gap-4">
                <AppointmentDateField
                  control={fieldControl}
                  name="startsAt"
                  label="Data de início"
                  portalContainer={sheetContentElement}
                  required
                />
                <AppointmentDateField
                  control={fieldControl}
                  name="endsAt"
                  label="Data de encerramento"
                  portalContainer={sheetContentElement}
                />
              </div>

              <FormField
                control={fieldControl}
                name="description"
                label="Descrição"
                renderControl={false}
              >
                {({ field }) => {
                  const description = typeof field.value === "string" ? field.value : "";

                  return (
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          {...field}
                          id={field.name}
                          value={description}
                          placeholder="Adicione informações adicionais (opcional)"
                          maxLength={500}
                          rows={5}
                          className="min-h-24 resize-y border-border/80 bg-background/40 pb-8"
                        />
                      </FormControl>
                      <span className="pointer-events-none absolute bottom-3 right-3 text-xs text-muted-foreground">
                        {description.length}/500
                      </span>
                    </div>
                  );
                }}
              </FormField>

              <FormField
                control={fieldControl}
                name="discountValue"
                label="Desconto"
                renderControl={false}
              >
                {({ field }) => {
                  const discount = typeof field.value === "string" ? field.value : "";

                  return (
                    <div className="space-y-1.5">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                          R$
                        </span>
                        <FormControl>
                          <Input
                            id={field.name}
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            placeholder="0,00"
                            className="h-10 border-border/80 bg-background/40 pl-10 tabular-nums"
                            value={discount}
                            onChange={(event) =>
                              handleNumericInputChange(event, field.onChange, {
                                formatAsCurrency: true,
                                showCurrencySymbol: false,
                              })
                            }
                            onBlur={field.onBlur}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>Valor de desconto (opcional)</FormDescription>
                    </div>
                  );
                }}
              </FormField>
            </div>

            <SheetFooter className="mt-auto flex-col gap-3 p-0 pt-2 sm:flex-row sm:justify-end sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full sm:w-32"
                onClick={() => handleSheetOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="h-10 w-full sm:w-40">
                Salvar agendamento
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
