"use client";

import { useCallback, useEffect, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, CreditCard } from "lucide-react";
import {
  FormProvider,
  useForm,
  useWatch,
  type Control,
  type FieldValues,
  type Resolver,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DiscardChangesButton } from "@/components/ui/form/discard-changes-button";
import { CNPJ_MASK } from "@/shared/constants/input-masks";
import { useFormChanges } from "@/shared/hooks/use-form-changes";
import { useUpdateEstablishment } from "@/features/establishment/hooks/use-update-establishment";
import type { Establishment } from "@/features/establishment/types";

import { useRegisterSettingsUnsavedChanges } from "../context/settings-unsaved-changes-context";
import {
  businessSettingsDefaultValues,
  businessSettingsSchema,
  mapBusinessFormToPatchPayload,
  mapEstablishmentToBusinessFormDefaults,
  type BusinessSettingsFormInput,
  type BusinessSettingsFormValues,
} from "../schemas/business-settings-schema";
import { StandartInputField } from "../../../components/ui/form/standart-input-field";

type SettingsBusinessFormProps = {
  establishment: Establishment;
};

export function SettingsBusinessForm({ establishment }: SettingsBusinessFormProps) {
  const { mutate, isPending } = useUpdateEstablishment();

  const methods = useForm<BusinessSettingsFormInput, undefined, BusinessSettingsFormValues>({
    resolver: zodResolver(businessSettingsSchema) as Resolver<
      BusinessSettingsFormInput,
      undefined,
      BusinessSettingsFormValues
    >,
    defaultValues: businessSettingsDefaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { control, handleSubmit, reset } = methods;
  const fieldControl = control as unknown as Control<FieldValues>;

  const initialPayload = useMemo(() => {
    const defaults = mapEstablishmentToBusinessFormDefaults(establishment);
    const parsed = businessSettingsSchema.safeParse(defaults);
    return parsed.success ? mapBusinessFormToPatchPayload(parsed.data) : null;
  }, [establishment]);

  const { getChangedPayload, hasChanges } = useFormChanges(initialPayload);

  const watchedValues = useWatch({ control });
  const currentPayload = useMemo(() => {
    const parsed = businessSettingsSchema.safeParse(watchedValues);
    return parsed.success ? mapBusinessFormToPatchPayload(parsed.data) : initialPayload;
  }, [watchedValues, initialPayload]);

  useEffect(() => {
    reset(mapEstablishmentToBusinessFormDefaults(establishment));
  }, [establishment, reset]);

  const persistBusiness = useCallback(
    (values: BusinessSettingsFormValues) => {
      const payload = mapBusinessFormToPatchPayload(values);

      if (!hasChanges(payload)) {
        return Promise.resolve(true);
      }

      return new Promise<boolean>((resolve) => {
        mutate(
          {
            establishmentId: establishment.id,
            payload: getChangedPayload(payload),
          },
          {
            onSuccess: (updatedEstablishment) => {
              reset(mapEstablishmentToBusinessFormDefaults(updatedEstablishment));
              resolve(true);
            },
            onError: () => resolve(false),
          },
        );
      });
    },
    [establishment.id, getChangedPayload, hasChanges, mutate, reset],
  );

  const onSubmit = (values: BusinessSettingsFormValues) => {
    void persistBusiness(values);
  };

  const saveFromTabGuard = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      void handleSubmit(
        async (values) => {
          resolve(await persistBusiness(values));
        },
        () => resolve(false),
      )();
    });
  }, [handleSubmit, persistBusiness]);

  const discardFromTabGuard = useCallback(() => {
    reset(mapEstablishmentToBusinessFormDefaults(establishment));
  }, [establishment, reset]);

  useRegisterSettingsUnsavedChanges("company", {
    hasUnsavedChanges: Boolean(currentPayload && hasChanges(currentPayload)),
    isSaving: isPending,
    save: saveFromTabGuard,
    discard: discardFromTabGuard,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Negócio</CardTitle>
        <CardDescription>
          Gerencie os dados comerciais utilizados em seu catálogo e canais de atendimento.
        </CardDescription>
      </CardHeader>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <StandartInputField
              control={fieldControl}
              name="tradeName"
              label="Nome Comercial"
              icon={Building2}
              placeholder="Ex.: CleanMove Auto Center"
              autoComplete="organization"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <StandartInputField
                control={fieldControl}
                name="legalBusinessName"
                label="Razão social"
                icon={Building2}
                placeholder="Ex.: CleanMove LTDA"
                autoComplete="organization"
              />

              <StandartInputField
                control={fieldControl}
                name="cnpj"
                label="CNPJ"
                icon={CreditCard}
                mask={CNPJ_MASK}
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <DiscardChangesButton
              disabled={!currentPayload || !hasChanges(currentPayload) || isPending}
              onClick={discardFromTabGuard}
            />
            <Button
              type="submit"
              disabled={!currentPayload || !hasChanges(currentPayload) || isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
