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
import { LoaderCircle } from "lucide-react";
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
  type CreateAppointmentRequestBody,
  type CreateAppointmentFormValues,
} from "../../schemas/create-appointment-schema";
import { updateAppointmentFormSchema } from "../../schemas/update-appointment-schema";
import { AppointmentDateField } from "./appointment-date-field";
import { useListCustomerOptions } from "../../hooks/queries/use-list-customer-options";
import { useListCustomerVehicleOptions } from "../../hooks/queries/use-list-customer-vehicle-options";
import { useListServiceOptions } from "../../hooks/queries/use-list-service-options";
import { useCreateAppointment } from "../../hooks/mutations/use-create-appointment-mutation";
import { useUpdateAppointment } from "../../hooks/mutations/use-update-appointment-mutation";
import type { AppointmentCalendarEvent } from "../../types/appointment-calendar";

type AppointmentFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStartsAt?: Date;
  appointment?: AppointmentCalendarEvent | null;
};

function mergeOptionItems(options: Option[], selectedOptions: Option[]) {
  const selectedValues = new Set(selectedOptions.map((option) => option.value));

  return [...selectedOptions, ...options.filter((option) => !selectedValues.has(option.value))];
}

function getAppointmentFormDefaultValues(
  appointment: AppointmentCalendarEvent,
): CreateAppointmentFormInput {
  return {
    customerId: appointment.extendedProps.customerId,
    serviceIds: appointment.extendedProps.serviceIds,
    vehicleId: appointment.extendedProps.vehicleId,
    startsAt: appointment.startsAt,
    endsAt: appointment.extendedProps.endsAt,
    description: appointment.extendedProps.description,
    discountValue: appointment.extendedProps.discountValue,
  };
}

function buildAppointmentRequestBody(
  values: CreateAppointmentFormValues,
): CreateAppointmentRequestBody {
  return {
    ...values,
    serviceIds: values.serviceIds.map((item) => item.value),
  };
}

function getComparableRequestBody(values: CreateAppointmentFormInput) {
  const result = createAppointmentFormSchema.safeParse(values);

  return result.success ? buildAppointmentRequestBody(result.data) : null;
}

function areServiceIdsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function getChangedRequestBody(
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

  if (!areServiceIdsEqual(currentBody.serviceIds, initialBody.serviceIds)) {
    changedBody.serviceIds = currentBody.serviceIds;
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

export function AppointmentFormSheet({
  open,
  onOpenChange,
  defaultStartsAt,
  appointment,
}: AppointmentFormSheetProps) {
  const isEditing = Boolean(appointment);
  const formDefaultValues = useMemo<CreateAppointmentFormInput>(
    () =>
      appointment
        ? getAppointmentFormDefaultValues(appointment)
        : {
            ...createAppointmentDefaultValues,
            startsAt: defaultStartsAt ?? null,
          },
    [appointment, defaultStartsAt],
  );
  const initialUpdateRequestBody = useMemo(
    () => (appointment ? getComparableRequestBody(formDefaultValues) : null),
    [appointment, formDefaultValues],
  );

  const methods = useForm<CreateAppointmentFormInput, undefined, CreateAppointmentFormValues>({
    resolver: zodResolver(
      isEditing ? updateAppointmentFormSchema : createAppointmentFormSchema,
    ) as Resolver<CreateAppointmentFormInput, undefined, CreateAppointmentFormValues>,
    defaultValues: formDefaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const {
    clearErrors,
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
    setValue,
  } = methods;
  const fieldControl = control as unknown as Control<FieldValues>;
  const sheetContentRef = useRef<HTMLDivElement | null>(null);
  const [sheetContentElement, setSheetContentElement] = useState<HTMLDivElement | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [customerLabel, setCustomerLabel] = useState("");
  const [vehicleLabel, setVehicleLabel] = useState("");
  const [serviceInputValue, setServiceInputValue] = useState("");
  const serviceSearch = useDebouncedValue(serviceInputValue, 500);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    reset(formDefaultValues);
    /* eslint-disable react-hooks/set-state-in-effect -- hidrata inputs controlados ao abrir o sheet em modo criação/edição */
    setCustomerSearch("");
    setCustomerLabel(appointment?.extendedProps.customer ?? "");
    setVehicleSearch("");
    setVehicleLabel(appointment?.extendedProps.vehicle ?? "");
    setServiceInputValue("");
    setSelectedCustomerId(formDefaultValues.customerId || null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [appointment, formDefaultValues, open, reset]);

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
  const { mutate: createAppointment, isPending: creatingAppointment } = useCreateAppointment();
  const { mutate: updateAppointment, isPending: updatingAppointment } = useUpdateAppointment();
  const isSubmitting = creatingAppointment || updatingAppointment;

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
              label: appointment.extendedProps.vehicle,
              value: appointment.extendedProps.vehicleId,
            },
          ]
        : [];

    return mergeOptionItems(options, selectedOptions);
  }, [appointment, vehicleOptions]);

  const handleCustomerSelectedItemChange = useCallback(
    (option: ComboboxItemOption | null) => {
      setSelectedCustomerId(option?.value ?? null);
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
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const resetOptionState = useCallback(() => {
    setCustomerSearch("");
    setCustomerLabel("");
    setVehicleLabel("");
    setServiceInputValue("");
    setVehicleSearch("");
    setSelectedCustomerId(null);
  }, []);

  const closeSheetAfterSave = useCallback(() => {
    reset(formDefaultValues);
    resetOptionState();
    onOpenChange(false);
  }, [formDefaultValues, onOpenChange, reset, resetOptionState]);

  const handleSheetOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isSubmitting) {
        return;
      }

      if (!nextOpen) {
        resetOptionState();
      }

      onOpenChange(nextOpen);
    },
    [isSubmitting, onOpenChange, resetOptionState],
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

  const serviceOptionsItems = useMemo(() => {
    const options =
      serviceOptions?.services?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? [];

    return mergeOptionItems(options, appointment?.extendedProps.serviceIds ?? []);
  }, [appointment, serviceOptions]);

  const getServiceEmptyIndicator = () => {
    if (isLoadingServiceOptions) {
      return <p className="px-2 py-1 text-sm text-muted-foreground">Buscando serviços...</p>;
    }

    return <p className="px-2 py-1 text-sm text-muted-foreground">Nenhum serviço encontrado.</p>;
  };

  const onSubmit = (values: CreateAppointmentFormValues) => {
    if (isSubmitting) return;

    const body = buildAppointmentRequestBody(values);

    if (appointment) {
      const changedBody = getChangedRequestBody(body, initialUpdateRequestBody);

      if (Object.keys(changedBody).length === 0) {
        toast.info("Nenhuma alteração para salvar.");
        return;
      }

      updateAppointment(
        {
          appointmentId: appointment.id,
          body: changedBody,
        },
        {
          onSuccess: closeSheetAfterSave,
        },
      );
      return;
    }

    createAppointment(body, {
      onSuccess: closeSheetAfterSave,
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        ref={handleSheetContentRef}
        side="right"
        className="flex w-full max-w-full flex-col gap-0 overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader className="text-left">
          <SheetTitle>{isEditing ? "Editar agendamento" : "Novo agendamento"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Atualize os dados necessários deste agendamento."
              : "Preencha os dados para criar um novo agendamento."}
          </SheetDescription>
        </SheetHeader>

        <FormProvider {...methods}>
          <form
            className="flex flex-1 flex-col gap-6 py-6"
            aria-busy={isSubmitting}
            aria-describedby={isSubmitting ? "appointment-submit-status" : undefined}
            onSubmit={handleSubmit(onSubmit)}
          >
            <fieldset disabled={isSubmitting} className="space-y-5 disabled:opacity-80">
              <FormField
                control={fieldControl}
                name="customerId"
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
                      value={customerLabel}
                      onValueChange={setCustomerLabel}
                      onDebouncedValueChange={setCustomerSearch}
                      onSelectedItemChange={handleCustomerSelectedItemChange}
                      onBlur={field.onBlur}
                      items={customerOptionsItems}
                      portalContainer={sheetContentRef}
                      placeholder="Digite o nome do cliente"
                      emptyMessage={getCustomerEmptyMessage()}
                      autoComplete="name"
                      disabled={isSubmitting}
                      required
                      className="w-[calc(100%-2rem)] min-[360px]:w-full"
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
                      disabled={isSubmitting}
                      className={cn(
                        "min-h-10 border-border/80 bg-background/40 py-2 shadow-sm w-[calc(100%-2rem)] min-[360px]:w-full",
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
                name="vehicleId"
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
                      value={vehicleLabel}
                      onValueChange={setVehicleLabel}
                      onDebouncedValueChange={setVehicleSearch}
                      onSelectedItemChange={handleVehicleSelectedItemChange}
                      onBlur={field.onBlur}
                      items={customerVehicleOptionsItems}
                      portalContainer={sheetContentRef}
                      placeholder="Digite o nome do veículo"
                      emptyMessage={getVehicleEmptyMessage()}
                      autoComplete="off"
                      disabled={!selectedCustomerId || isSubmitting}
                      required
                      className="w-[calc(100%-2rem)] min-[360px]:w-full"
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
                  disabled={isSubmitting}
                  required
                  className="w-[calc(100%-2rem)] min-[360px]:w-full"
                  timeInputClassName="w-24 min-[380px]:w-28"
                />
                <AppointmentDateField
                  control={fieldControl}
                  name="endsAt"
                  label="Data de encerramento"
                  portalContainer={sheetContentElement}
                  disabled={isSubmitting}
                  className="w-[calc(100%-2rem)] min-[360px]:w-full"
                  timeInputClassName="w-24 min-[380px]:w-28"
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
                          className="w-[calc(100%-2rem)] resize-y border-border/80 bg-background/40 pb-8 min-[360px]:w-full"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <span className="pointer-events-none absolute bottom-3 right-[calc(2.5rem+3px)] text-xs text-muted-foreground">
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
                            className="h-10 border-border/80 bg-background/40 pl-10 tabular-nums w-[calc(100%-2rem)] min-[360px]:w-full"
                            value={discount}
                            disabled={isSubmitting}
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
            </fieldset>

            <SheetFooter className="mt-auto flex-col gap-3 border-t border-border p-0 pt-4 sm:flex-col sm:space-x-0">
              {isSubmitting ? (
                <div
                  id="appointment-submit-status"
                  role="status"
                  aria-live="polite"
                  className="flex min-h-10 items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 text-sm font-medium text-primary"
                >
                  <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden />
                  {isEditing ? "Atualizando agendamento..." : "Salvando agendamento..."}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  className="h-10 w-full sm:w-32"
                  onClick={() => handleSheetOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-10 w-full sm:w-40"
                  disabled={isSubmitting || (isEditing && !isDirty)}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden />
                  ) : null}
                  {isSubmitting
                    ? isEditing
                      ? "Atualizando..."
                      : "Salvando..."
                    : isEditing
                      ? "Salvar alterações"
                      : "Salvar agendamento"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
