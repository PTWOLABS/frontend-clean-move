"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, CreditCard, Link2 } from "lucide-react";
import {
  FormProvider,
  useForm,
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
import { CNPJ_MASK } from "@/shared/constants/input-masks";
import { useUpdateEstablishment } from "@/features/establishment/hooks/use-update-establishment";
import type { Establishment } from "@/features/establishment/types";

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

  const { control, handleSubmit, reset, formState } = methods;
  const { isDirty } = formState;
  const fieldControl = control as unknown as Control<FieldValues>;

  useEffect(() => {
    reset(mapEstablishmentToBusinessFormDefaults(establishment));
  }, [establishment, reset]);

  const onSubmit = (values: BusinessSettingsFormValues) => {
    if (!isDirty) {
      return;
    }

    mutate(
      {
        establishmentId: establishment.id,
        payload: mapBusinessFormToPatchPayload(values),
      },
      {
        onSuccess: (updatedEstablishment) => {
          reset(mapEstablishmentToBusinessFormDefaults(updatedEstablishment));
        },
      },
    );
  };

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
              label="Nome fantasia"
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

            <StandartInputField
              control={fieldControl}
              name="slug"
              label="Slug do catálogo"
              icon={Link2}
              placeholder="Ex.: clean-move-auto-center"
              autoComplete="off"
            />
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={!isDirty || isPending} className="w-full sm:w-auto">
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
