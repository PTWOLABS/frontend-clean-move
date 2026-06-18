"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import {
  FormProvider,
  useForm,
  useWatch,
  type Control,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form/field";
import { InputField } from "@/components/ui/form/input-field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/shared/api/httpClient";
import {
  CPF_MASK,
  cpfCnpjMaskModify,
  DATE_MASK,
  getCpfCnpjMask,
  PHONE_MASK,
  ZIP_CODE_MASK,
} from "@/shared/constants/input-masks";
import { useZipCodeAutofill, type ZipCodeAutofillForm } from "@/shared/hooks/use-zipcode-autofill";

import { useCreateCustomer } from "../hooks/use-create-customer";
import { useUpdateCustomer } from "../hooks/use-update-customer";
import { getCustomerMutationFeedbackError } from "../lib/customer-mutation-feedback";
import { isCustomerPartialCreationError } from "../lib/customer-partial-creation-error";
import { mapCustomerApiFieldErrorsToForm } from "../lib/map-api-field-to-form";
import {
  customerFormDefaultValues,
  customerFormSchema,
  customerToFormDefaults,
  emptyAddressFormValues,
  emptyVehicleFormValues,
  hasVehicleData,
  type CustomerFormInput,
  type CustomerFormValues,
} from "../schemas/customer-form-schema";
import type { CustomerVehicleDto, CustomerWithPrimaryVehicle } from "../types";

type CustomerFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCustomer: CustomerWithPrimaryVehicle | null;
};

function applyCustomerApiFieldErrors(
  error: unknown,
  mutationType: "create" | "update",
  setError: ReturnType<
    typeof useForm<CustomerFormInput, undefined, CustomerFormValues>
  >["setError"],
) {
  if (!(error instanceof ApiError)) return;

  const feedback = getCustomerMutationFeedbackError(error, mutationType);
  if (!feedback.fieldErrors) return;

  const formErrors = mapCustomerApiFieldErrorsToForm(feedback.fieldErrors);
  for (const [field, message] of Object.entries(formErrors)) {
    if (!message) continue;
    setError(field as keyof CustomerFormInput, { type: "server", message });
  }
}

export function CustomerFormSheet({ open, onOpenChange, editingCustomer }: CustomerFormSheetProps) {
  const { mutate: createMutate, isPending: isCreatePending } = useCreateCustomer();
  const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateCustomer();
  const [persistedCustomer, setPersistedCustomer] = useState<CustomerWithPrimaryVehicle | null>(
    null,
  );
  const [cpfCnpjMask, setCpfCnpjMask] = useState(CPF_MASK);

  const activeCustomer = editingCustomer ?? persistedCustomer;
  const isEditMode = Boolean(activeCustomer?.id);
  const isPending = isCreatePending || isUpdatePending;

  const methods = useForm<CustomerFormInput, undefined, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema) as Resolver<
      CustomerFormInput,
      undefined,
      CustomerFormValues
    >,
    defaultValues: customerFormDefaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { control, reset, handleSubmit, setValue, formState, clearErrors, getValues, setError } =
    methods;
  const { isDirty } = formState;
  const fieldControl = control as unknown as Control<FieldValues>;
  const zipCodeAutofillForm = {
    clearErrors,
    control: fieldControl,
    getValues,
    setError,
    setValue,
  } as unknown as ZipCodeAutofillForm;

  const includeAddress = useWatch({ control, name: "includeAddress" });
  const includeVehicle = useWatch({ control, name: "includeVehicle" });
  const vehicleId = useWatch({ control, name: "vehicle.id" });
  const needsVehicleRecovery =
    Boolean(persistedCustomer) && includeVehicle && !vehicleId;

  const primaryVehicleFromCustomer =
    activeCustomer?.vehicles?.[0] ?? activeCustomer?.primaryVehicle ?? null;
  const hasExistingPrimaryVehicle = isEditMode && Boolean(primaryVehicleFromCustomer?.id);
  const showVehicleSection = includeVehicle || hasExistingPrimaryVehicle;

  const { isFetchingAddress, hasAddressFetchError } = useZipCodeAutofill(
    zipCodeAutofillForm,
    {
      zipCode: "address.zipCode",
      street: "address.street",
      city: "address.city",
      state: "address.state",
      complement: "address.complement",
    },
    { enabled: includeAddress },
  );

  const addressFieldsDisabled = isFetchingAddress;

  useEffect(() => {
    if (!open) return;

    if (editingCustomer) {
      const primaryVehicle =
        editingCustomer.vehicles?.[0] ?? editingCustomer.primaryVehicle ?? null;
      const defaults = customerToFormDefaults(editingCustomer, primaryVehicle);
      setCpfCnpjMask(getCpfCnpjMask(defaults.cpfCnpj ?? ""));
      reset(defaults);
      return;
    }

    if (persistedCustomer) return;

    setCpfCnpjMask(CPF_MASK);
    reset(customerFormDefaultValues);
  }, [open, editingCustomer, persistedCustomer, reset]);

  useEffect(() => {
    if (!open || !hasExistingPrimaryVehicle || !activeCustomer) return;

    if (!includeVehicle) {
      setValue("includeVehicle", true, { shouldValidate: true, shouldDirty: false });
    }

    const currentVehicle = getValues("vehicle");
    if (currentVehicle?.id || hasVehicleFormData(currentVehicle)) return;
    if (!hasVehicleData(primaryVehicleFromCustomer)) return;

    setValue(
      "vehicle",
      customerToFormDefaults(activeCustomer, primaryVehicleFromCustomer).vehicle,
      { shouldValidate: true, shouldDirty: false },
    );
  }, [
    open,
    activeCustomer,
    getValues,
    hasExistingPrimaryVehicle,
    includeVehicle,
    primaryVehicleFromCustomer,
    setValue,
  ]);

  const handleSheetOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPersistedCustomer(null);
      setCpfCnpjMask(CPF_MASK);
    }

    onOpenChange(nextOpen);
  };

  const handleCloseAfterSave = () => {
    setPersistedCustomer(null);
    setCpfCnpjMask(CPF_MASK);
    reset(customerFormDefaultValues);
    onOpenChange(false);
  };

  const handleIncludeAddressChange = (checked: boolean) => {
    setValue("includeAddress", checked, { shouldDirty: true, shouldValidate: true });
    if (!checked) {
      setValue("address", emptyAddressFormValues, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleIncludeVehicleChange = (checked: boolean) => {
    if (hasExistingPrimaryVehicle) return;

    setValue("includeVehicle", checked, { shouldDirty: true, shouldValidate: true });

    if (!checked) {
      if (!isEditMode) {
        setValue("vehicle", emptyVehicleFormValues, { shouldDirty: true, shouldValidate: true });
      }
      return;
    }

    if (!isEditMode) return;

    const currentVehicle = getValues("vehicle");
    if (currentVehicle?.id || hasVehicleFormData(currentVehicle)) {
      return;
    }

    const restoreSource = editingCustomer ?? persistedCustomer;
    if (!restoreSource) return;

    const primaryVehicle = restoreSource.vehicles?.[0] ?? restoreSource.primaryVehicle ?? null;
    if (!hasVehicleData(primaryVehicle)) return;

    setValue("vehicle", customerToFormDefaults(restoreSource, primaryVehicle).vehicle, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = (values: CustomerFormValues) => {
    if (isEditMode) {
      if (!activeCustomer?.id) {
        toast.error("Identificador do cliente em falta. Atualize a página.");
        return;
      }

      if (!isDirty && !needsVehicleRecovery) {
        toast.info("Nenhuma alteração para salvar.");
        return;
      }

      updateMutate(
        { customerId: activeCustomer.id, values },
        {
          onSuccess: handleCloseAfterSave,
          onError: (error) => {
            if (error instanceof ApiError && error.statusCode === 409) {
              if (error.message.includes("Vehicle already registered")) {
                setError("vehicle.plate", {
                  type: "server",
                  message: "Já existe um veículo com essa placa.",
                });
              }
              return;
            }

            applyCustomerApiFieldErrors(error, "update", setError);
          },
        },
      );
      return;
    }

    createMutate(values, {
      onSuccess: handleCloseAfterSave,
      onError: (error) => {
        if (isCustomerPartialCreationError(error)) {
          const currentVehicle = getValues("vehicle");
          const defaults = {
            ...customerToFormDefaults(error.customer, null),
            includeVehicle: values.includeVehicle,
            vehicle: currentVehicle,
          };
          setPersistedCustomer(error.customer);
          setCpfCnpjMask(getCpfCnpjMask(defaults.cpfCnpj ?? ""));
          clearErrors();
          reset(defaults, { keepDirty: true });
          return;
        }

        applyCustomerApiFieldErrors(error, "create", setError);
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader className="text-left">
          <SheetTitle>{isEditMode ? "Editar cliente" : "Novo cliente"}</SheetTitle>
          <SheetDescription>
            Preencha os dados principais do cliente. Use os toggles abaixo para incluir endereço ou
            cadastrar um veículo, se necessário.
          </SheetDescription>
        </SheetHeader>

        <FormProvider {...methods}>
          <form
            className="flex flex-1 flex-col gap-6 py-6"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="space-y-4">
              <InputField
                control={fieldControl}
                name="fullName"
                label="Nome completo"
                required
                placeholder="Ex.: João da Silva"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  control={fieldControl}
                  name="phone"
                  label="Telefone"
                  mask={PHONE_MASK}
                  inputMode="tel"
                />
                <InputField
                  control={fieldControl}
                  name="email"
                  label="E-mail"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  control={fieldControl}
                  name="cpfCnpj"
                  label="CPF/CNPJ"
                  mask={cpfCnpjMask}
                  modify={cpfCnpjMaskModify}
                  inputMode="numeric"
                  onChange={(event) => {
                    const nextMask = getCpfCnpjMask(event.target.value);
                    setCpfCnpjMask((current) => (current === nextMask ? current : nextMask));
                  }}
                />
                <InputField
                  control={fieldControl}
                  name="nickname"
                  label="Apelido"
                  placeholder="Como prefere ser chamado"
                />
              </div>
              <InputField
                control={fieldControl}
                name="birthDate"
                label="Data de nascimento"
                mask={DATE_MASK}
                placeholder="dd/mm/aaaa"
                inputMode="numeric"
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={fieldControl}
                name="includeAddress"
                label="Incluir endereço"
                className="flex flex-row items-center justify-between rounded-lg border border-border p-4"
                renderControl={false}
              >
                {({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={handleIncludeAddressChange}
                    aria-label="Incluir endereço"
                    className="shrink-0"
                  />
                )}
              </FormField>

              {includeAddress ? (
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Endereço</h3>
                  <InputField
                    control={fieldControl}
                    name="address.zipCode"
                    label="CEP"
                    required
                    mask={ZIP_CODE_MASK}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    disabled={addressFieldsDisabled}
                    image={
                      isFetchingAddress ? (
                        <LoaderCircle
                          aria-hidden
                          className="size-5 animate-spin text-muted-foreground"
                        />
                      ) : undefined
                    }
                  />
                  {isFetchingAddress || hasAddressFetchError ? (
                    <p className="-mt-2 text-xs font-medium text-muted-foreground">
                      {isFetchingAddress
                        ? "Buscando endereço pelo CEP..."
                        : "Não foi possível consultar o CEP. Preencha o endereço manualmente."}
                    </p>
                  ) : null}
                  <InputField
                    control={fieldControl}
                    name="address.street"
                    label="Rua"
                    required
                    autoComplete="address-line1"
                    disabled={addressFieldsDisabled}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      control={fieldControl}
                      name="address.city"
                      label="Cidade"
                      required
                      autoComplete="address-level2"
                      disabled={addressFieldsDisabled}
                    />
                    <InputField
                      control={fieldControl}
                      name="address.state"
                      label="UF"
                      required
                      autoComplete="address-level1"
                      disabled={addressFieldsDisabled}
                    />
                  </div>
                  <InputField
                    control={fieldControl}
                    name="address.country"
                    label="País"
                    required
                    disabled={addressFieldsDisabled}
                  />
                  <InputField
                    control={fieldControl}
                    name="address.complement"
                    label="Complemento"
                    autoComplete="address-line3"
                    disabled={addressFieldsDisabled}
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <FormField
                control={fieldControl}
                name="includeVehicle"
                label="Incluir veículo"
                className="flex flex-row items-center justify-between rounded-lg border border-border p-4"
                renderControl={false}
              >
                {({ field }) => (
                  <Switch
                    checked={hasExistingPrimaryVehicle ? true : field.value}
                    onCheckedChange={handleIncludeVehicleChange}
                    disabled={hasExistingPrimaryVehicle || isPending}
                    aria-label="Incluir veículo"
                    className="shrink-0"
                  />
                )}
              </FormField>

              {showVehicleSection ? (
                <div className="space-y-4 rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Veículo principal</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      control={fieldControl}
                      name="vehicle.plate"
                      label="Placa"
                      placeholder="ABC1234"
                    />
                    <InputField
                      control={fieldControl}
                      name="vehicle.year"
                      label="Ano"
                      type="number"
                      min={1900}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      control={fieldControl}
                      name="vehicle.brand"
                      label="Marca"
                      required
                    />
                    <InputField
                      control={fieldControl}
                      name="vehicle.model"
                      label="Modelo"
                      required
                    />
                  </div>
                  <InputField control={fieldControl} name="vehicle.color" label="Cor" />
                  <FormField
                    control={fieldControl}
                    name="vehicle.notes"
                    label="Observações"
                    renderControl={false}
                  >
                    {({ field }) => (
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        rows={3}
                        placeholder="Ex.: arranhão na lateral, película, etc."
                      />
                    )}
                  </FormField>
                </div>
              ) : null}
            </div>

            <SheetFooter className="mt-auto flex-col gap-2 border-t border-border p-0 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isPending}
                onClick={() => handleSheetOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isPending || (isEditMode && !isDirty && !needsVehicleRecovery)}
              >
                {isPending ? "Salvando..." : isEditMode ? "Salvar alterações" : "Criar cliente"}
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}

function hasVehicleFormData(vehicle?: CustomerFormInput["vehicle"] | CustomerVehicleDto | null) {
  if (!vehicle) return false;

  return Boolean(
    vehicle.plate?.trim() ||
    vehicle.brand?.trim() ||
    vehicle.model?.trim() ||
    vehicle.color?.trim() ||
    vehicle.year != null ||
    vehicle.notes?.trim(),
  );
}
