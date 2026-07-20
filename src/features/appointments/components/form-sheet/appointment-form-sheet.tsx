"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  useWatch,
  type Control,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxItemOption } from "@/components/ui/combobox/combobox";
import { DiscardChangesButton } from "@/components/ui/form/discard-changes-button";
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
import { cn } from "@/shared/utils/cn";
import { handleNumericInputChange } from "@/shared/utils/lib";

import {
  createAppointmentDefaultValues,
  createAppointmentFormSchema,
  type CreateAppointmentFormInput,
  type CreateAppointmentFormValues,
} from "../../schemas/create-appointment-schema";
import { updateAppointmentFormSchema } from "../../schemas/update-appointment-schema";
import {
  buildAppointmentRequestBody,
  getChangedRequestBody,
  getComparableRequestBody,
  getResolvedResourceRequestFields,
} from "../../lib/appointment-form-request";
import { getAppointmentFormDefaultValues } from "../../lib/appointment-form-values";
import { AppointmentDateField } from "./appointment-date-field";
import {
  AppointmentResourceStatusAction,
  AppointmentServiceResourceStatusAction,
} from "./appointment-service-resource-status-action";
import { useAppointmentFormOptions } from "../../hooks/use-appointment-form-options";
import { useAppointmentFormResourceStatus } from "../../hooks/use-appointment-form-resource-status";
import { useAppointmentFormServices } from "../../hooks/use-appointment-form-services";
import { useCreateAppointment } from "../../hooks/mutations/use-create-appointment-mutation";
import { useUpdateAppointment } from "../../hooks/mutations/use-update-appointment-mutation";
import type { AppointmentCalendarEvent } from "../../types/appointment-calendar";

type AppointmentFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStartsAt?: Date;
  appointment?: AppointmentCalendarEvent | null;
};

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
    getValues,
    handleSubmit,
    reset,
    setValue,
  } = methods;
  const fieldControl = control as unknown as Control<FieldValues>;
  const sheetContentRef = useRef<HTMLDivElement | null>(null);
  const [sheetContentElement, setSheetContentElement] = useState<HTMLDivElement | null>(null);
  const selectedServices = useWatch({
    control,
    name: "services",
  });
  const selectedServiceOptions = useWatch({
    control,
    name: "serviceIds",
  });
  const selectedCustomerFormId = useWatch({
    control,
    name: "customerId",
  });
  const selectedVehicleFormId = useWatch({
    control,
    name: "vehicleId",
  });
  const {
    clearCustomerAndVehicleSelection,
    clearServiceSearch,
    clearVehicleSelection,
    customerEmptyMessage,
    customerFetchNextPage,
    customerHasMore,
    customerIsFetchingNextPage,
    customerLabel,
    customerOptionsItems,
    customerVehicleOptionsItems,
    hydrateOptionState,
    resetOptionState,
    selectedCustomerId,
    serviceEmptyMessage,
    serviceFetchNextPage,
    serviceHasMore,
    serviceIsFetchingNextPage,
    serviceOptionsItems,
    servicePriceById,
    setCustomerLabel,
    setCustomerSearch,
    setSelectedCustomerId,
    setServiceInputValue,
    setVehicleLabel,
    setVehicleSearch,
    vehicleEmptyMessage,
    vehicleFetchNextPage,
    vehicleHasMore,
    vehicleIsFetchingNextPage,
    vehicleLabel,
  } = useAppointmentFormOptions({
    appointment,
    selectedCustomerFormId,
    selectedServiceOptions,
    selectedVehicleFormId,
  });
  const {
    customerResourceStatus,
    getServiceResourceStatus,
    handleRemoveCustomer,
    handleRemoveService,
    handleRemoveVehicle,
    hasLockedSnapshotService,
    vehicleResourceStatus,
  } = useAppointmentFormResourceStatus({
    appointment,
    clearCustomerAndVehicleSelection,
    clearServiceSearch,
    clearVehicleSelection,
    control,
    getValues,
    selectedServices,
    setValue,
  });

  useEffect(() => {
    if (!open) return;

    reset(formDefaultValues);
    hydrateOptionState({
      customerLabel: appointment?.extendedProps.customer ?? "",
      vehicleLabel: appointment?.extendedProps.vehicle.displayName ?? "",
      selectedCustomerId: formDefaultValues.customerId || null,
    });
  }, [appointment, formDefaultValues, hydrateOptionState, open, reset]);

  const { getServicePriceDescription, handleServiceOptionsChange } = useAppointmentFormServices({
    clearServiceSearch,
    getValues,
    isEditing,
    open,
    servicePriceById,
    setValue,
  });

  const resolvedResourceRequestFields = useMemo(
    () =>
      getResolvedResourceRequestFields(
        appointment,
        {
          customerId: selectedCustomerFormId ?? "",
          vehicleId: selectedVehicleFormId ?? "",
          services: selectedServices ?? [],
        },
        {
          customerLabel,
          vehicleLabel,
        },
      ),
    [
      appointment,
      customerLabel,
      selectedCustomerFormId,
      selectedServices,
      selectedVehicleFormId,
      vehicleLabel,
    ],
  );
  const hasResolvedResourceChange = resolvedResourceRequestFields.length > 0;

  const { mutate: createAppointment, isPending: creatingAppointment } = useCreateAppointment();
  const { mutate: updateAppointment, isPending: updatingAppointment } = useUpdateAppointment();
  const isSubmitting = creatingAppointment || updatingAppointment;

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
      const shouldValidateClearedVehicle = isEditing && Boolean(option);

      setValue("vehicleId", "", {
        shouldDirty: true,
        shouldTouch: shouldValidateClearedVehicle,
        shouldValidate: shouldValidateClearedVehicle,
      });
      if (!shouldValidateClearedVehicle) {
        clearErrors("vehicleId");
      }
    },
    [clearErrors, isEditing, setSelectedCustomerId, setValue, setVehicleLabel, setVehicleSearch],
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

  const getServiceEmptyIndicator = () => {
    return <p className="px-2 py-1 text-sm text-muted-foreground">{serviceEmptyMessage}</p>;
  };

  const onSubmit = (values: CreateAppointmentFormValues) => {
    if (isSubmitting) return;

    const body = buildAppointmentRequestBody(values);

    if (appointment) {
      const forcedFields = getResolvedResourceRequestFields(appointment, values, {
        customerLabel,
        vehicleLabel,
      });
      const changedBody = getChangedRequestBody(body, initialUpdateRequestBody, {
        forceFields: forcedFields,
      });

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
        data-cy="appointment-form-sheet"
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
            noValidate
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
                  <div className="space-y-1.5">
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
                        emptyMessage={customerEmptyMessage}
                        autoComplete="name"
                        disabled={isSubmitting || Boolean(customerResourceStatus)}
                        required
                        className="w-full"
                        hasMore={customerHasMore}
                        isLoadingMore={customerIsFetchingNextPage}
                        onLoadMore={() => {
                          void customerFetchNextPage();
                        }}
                      />
                    </FormControl>
                    <div className="flex flex-wrap items-center gap-2">
                      <AppointmentResourceStatusAction
                        disabled={isSubmitting}
                        resourceLabel={customerLabel}
                        resourceName="cliente"
                        removeActionLabel="Remover cliente"
                        removeTitle="Remover cliente deste agendamento?"
                        removeDescription={
                          <>
                            Isso remove &quot;{customerLabel}&quot; da edição atual e libera a
                            seleção de cliente. O veículo também será removido porque depende do
                            cliente selecionado. A alteração só será enviada ao salvar o
                            agendamento.
                          </>
                        }
                        status={customerResourceStatus}
                        onConfirmRemove={handleRemoveCustomer}
                      />
                    </div>
                  </div>
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
                  <>
                    <FormControl>
                      <MultipleSelector
                        value={Array.isArray(field.value) ? (field.value as Option[]) : []}
                        onChange={(options) => handleServiceOptionsChange(options, field.onChange)}
                        options={serviceOptionsItems}
                        portalContainer={sheetContentElement}
                        placeholder="Selecione os serviços"
                        emptyIndicator={getServiceEmptyIndicator()}
                        disabled={isSubmitting || hasLockedSnapshotService}
                        className={cn(
                          "min-h-10 border-border/80 bg-background/40 py-2 shadow-sm w-full",
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
                        hasMore={serviceHasMore}
                        isLoadingMore={serviceIsFetchingNextPage}
                        onLoadMore={() => {
                          void serviceFetchNextPage();
                        }}
                      />
                    </FormControl>
                    {hasLockedSnapshotService ? (
                      <FormDescription>
                        Remova os serviços atualizados ou removidos antes de alterar a lista.
                      </FormDescription>
                    ) : null}
                  </>
                )}
              </FormField>

              {selectedServices?.length ? (
                <div className="space-y-3 rounded-md border border-border/80 bg-background/30 p-3">
                  {selectedServices.map((service, index) => (
                    <FormField
                      key={service.serviceId}
                      control={fieldControl}
                      name={`services.${index}.price`}
                      label={`Valor do serviço: ${service.serviceLabel}`}
                      renderControl={false}
                    >
                      {({ field, fieldState }) => {
                        const serviceResourceStatus = getServiceResourceStatus(service);

                        return (
                          <div className="space-y-1.5">
                            <FormControl>
                              <Input
                                id={field.name}
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                placeholder="0,00"
                                className={cn(
                                  "h-10 border-border/80 bg-background/40 tabular-nums w-full",
                                  fieldState.invalid &&
                                    "border-destructive/70 focus-visible:ring-destructive/30",
                                )}
                                value={typeof field.value === "string" ? field.value : ""}
                                disabled={
                                  isSubmitting ||
                                  service.priceType === "FIXED" ||
                                  Boolean(serviceResourceStatus)
                                }
                                onChange={(event) =>
                                  handleNumericInputChange(event, field.onChange, {
                                    formatAsCurrency: true,
                                    showCurrencySymbol: false,
                                  })
                                }
                                onBlur={field.onBlur}
                              />
                            </FormControl>
                            <div className="flex flex-wrap items-center gap-2">
                              <FormDescription>
                                {getServicePriceDescription(service)}
                              </FormDescription>
                              <AppointmentServiceResourceStatusAction
                                disabled={isSubmitting}
                                serviceLabel={service.serviceLabel}
                                status={serviceResourceStatus}
                                onConfirmRemove={() => handleRemoveService(service.serviceId)}
                              />
                            </div>
                          </div>
                        );
                      }}
                    </FormField>
                  ))}
                </div>
              ) : null}

              <FormField
                control={fieldControl}
                name="vehicleId"
                label="Veículo"
                required
                renderControl={false}
              >
                {({ field }) => (
                  <div className="space-y-1.5">
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
                        emptyMessage={vehicleEmptyMessage}
                        autoComplete="off"
                        disabled={
                          !selectedCustomerId ||
                          isSubmitting ||
                          Boolean(customerResourceStatus) ||
                          Boolean(vehicleResourceStatus)
                        }
                        required
                        className="w-full"
                        hasMore={vehicleHasMore}
                        isLoadingMore={vehicleIsFetchingNextPage}
                        onLoadMore={() => {
                          void vehicleFetchNextPage();
                        }}
                      />
                    </FormControl>
                    <div className="flex flex-wrap items-center gap-2">
                      <AppointmentResourceStatusAction
                        disabled={isSubmitting}
                        resourceLabel={vehicleLabel}
                        resourceName="veículo"
                        removeActionLabel="Remover veículo"
                        removeTitle="Remover veículo deste agendamento?"
                        removeDescription={
                          <>
                            Isso remove &quot;{vehicleLabel}&quot; da edição atual e libera a
                            seleção de veículo. A alteração só será enviada ao salvar o agendamento.
                          </>
                        }
                        status={vehicleResourceStatus}
                        onConfirmRemove={handleRemoveVehicle}
                      />
                    </div>
                  </div>
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
                  className="w-full"
                  timeInputClassName="w-24 min-[380px]:w-28"
                />
                <AppointmentDateField
                  control={fieldControl}
                  name="endsAt"
                  label="Data de encerramento"
                  portalContainer={sheetContentElement}
                  disabled={isSubmitting}
                  className="w-full"
                  timeInputClassName="w-24 min-[380px]:w-28"
                  clearable
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
                          className="resize-y border-border/80 bg-background/40 pb-8 w-full scrollbar-clean"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <span className="pointer-events-none absolute bottom-3 right-[calc(1rem)] text-xs text-muted-foreground">
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
                            className="h-10 border-border/80 bg-background/40 pl-10 tabular-nums w-full"
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
                {isEditing ? (
                  <DiscardChangesButton
                    disabled={isSubmitting || (!isDirty && !hasResolvedResourceChange)}
                    className="h-10"
                    onClick={() => {
                      reset(formDefaultValues);
                      hydrateOptionState({
                        customerLabel: appointment?.extendedProps.customer ?? "",
                        vehicleLabel: appointment?.extendedProps.vehicle.displayName ?? "",
                        selectedCustomerId: formDefaultValues.customerId || null,
                      });
                    }}
                  />
                ) : null}
                <Button
                  type="submit"
                  className="h-10 w-full sm:w-40"
                  disabled={isSubmitting || (isEditing && !isDirty && !hasResolvedResourceChange)}
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
