"use client";

import { useEffect, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Hash, LoaderCircle, Mail, MapPin, Navigation, Phone, User } from "lucide-react";
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
import { InputField } from "@/components/ui/form/input-field";
import { PHONE_MASK, ZIP_CODE_MASK } from "@/shared/constants/input-masks";
import { useFormChanges } from "@/shared/hooks/use-form-changes";
import { useZipCodeAutofill, type ZipCodeAutofillForm } from "@/shared/hooks/use-zipcode-autofill";
import { useUpdateUserProfile } from "@/features/user/hooks/use-update-user-profile";
import type { User as UserProfile } from "@/features/user/types";

import {
  mapProfileFormToPatchPayload,
  mapUserToProfileFormDefaults,
  profileSettingsDefaultValues,
  profileSettingsSchema,
  type ProfileSettingsFormInput,
  type ProfileSettingsFormValues,
} from "../schemas/profile-settings-schema";
import { StandartInputField } from "../../../components/ui/form/standart-input-field";

type SettingsProfileFormProps = {
  user: UserProfile;
};

export function SettingsProfileForm({ user }: SettingsProfileFormProps) {
  const { mutate, isPending } = useUpdateUserProfile();

  const methods = useForm<ProfileSettingsFormInput, undefined, ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema) as Resolver<
      ProfileSettingsFormInput,
      undefined,
      ProfileSettingsFormValues
    >,
    defaultValues: profileSettingsDefaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { control, handleSubmit, reset, watch, clearErrors, getValues, setError, setValue } =
    methods;
  const fieldControl = control as unknown as Control<FieldValues>;

  const initialPayload = useMemo(() => {
    const defaults = mapUserToProfileFormDefaults(user);
    const parsed = profileSettingsSchema.safeParse(defaults);
    return parsed.success ? mapProfileFormToPatchPayload(parsed.data) : null;
  }, [user]);

  const { getChangedPayload, hasChanges } = useFormChanges(initialPayload);

  const watchedValues = watch();
  const currentPayload = useMemo(() => {
    const parsed = profileSettingsSchema.safeParse(watchedValues);
    return parsed.success ? mapProfileFormToPatchPayload(parsed.data) : initialPayload;
  }, [watchedValues, initialPayload]);

  const zipCodeAutofillForm = {
    clearErrors,
    control: fieldControl,
    getValues,
    setError,
    setValue,
  } as unknown as ZipCodeAutofillForm;

  const { isFetchingAddress, hasAddressFetchError } = useZipCodeAutofill(zipCodeAutofillForm, {
    zipCode: "address.zipCode",
    street: "address.street",
    city: "address.city",
    state: "address.state",
    complement: "address.complement",
  });

  useEffect(() => {
    reset(mapUserToProfileFormDefaults(user));
  }, [user, reset]);

  const onSubmit = (values: ProfileSettingsFormValues) => {
    const payload = mapProfileFormToPatchPayload(values);

    if (!hasChanges(payload)) {
      return;
    }

    mutate(getChangedPayload(payload), {
      onSuccess: (updatedUser) => {
        reset(mapUserToProfileFormDefaults(updatedUser));
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription>
          Gerencie seus dados de contato e endereço utilizados no sistema.
        </CardDescription>
      </CardHeader>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <StandartInputField
                control={fieldControl}
                name="name"
                label="Nome"
                icon={User}
                placeholder="Ex.: João Silva"
                autoComplete="name"
              />

              <StandartInputField
                control={fieldControl}
                name="email"
                label="E-mail"
                icon={Mail}
                type="email"
                placeholder="Ex.: joao@email.com"
                autoComplete="email"
              />
            </div>

            <StandartInputField
              control={fieldControl}
              name="phone"
              label="Telefone (com DDD)"
              icon={Phone}
              mask={PHONE_MASK}
              inputMode="tel"
              placeholder="(00) 00000-0000"
              autoComplete="tel"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <StandartInputField
                control={fieldControl}
                name="address.zipCode"
                label="CEP"
                icon={MapPin}
                mask={ZIP_CODE_MASK}
                inputMode="numeric"
                placeholder="00000-000"
                autoComplete="postal-code"
                disabled={isFetchingAddress}
                image={
                  isFetchingAddress ? (
                    <LoaderCircle
                      aria-hidden
                      className="size-4 animate-spin text-muted-foreground"
                    />
                  ) : undefined
                }
              />

              <StandartInputField
                control={fieldControl}
                name="address.street"
                label="Rua"
                icon={Navigation}
                placeholder="Rua, número"
                autoComplete="street-address"
                disabled={isFetchingAddress}
              />
            </div>

            {isFetchingAddress || hasAddressFetchError ? (
              <p className="text-xs text-muted-foreground">
                {isFetchingAddress
                  ? "Buscando endereço pelo CEP..."
                  : "Não foi possível consultar o CEP. Preencha o endereço manualmente."}
              </p>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <StandartInputField
                control={fieldControl}
                name="address.city"
                label="Cidade"
                icon={Building2}
                placeholder="Cidade"
                autoComplete="address-level2"
                disabled={isFetchingAddress}
              />

              <InputField
                control={fieldControl}
                name="address.state"
                label="Estado"
                placeholder="SP"
                maxLength={2}
                autoComplete="address-level1"
                disabled={isFetchingAddress}
              />
            </div>

            <StandartInputField
              control={fieldControl}
              name="address.complement"
              label="Complemento"
              icon={Hash}
              placeholder="Sala, bloco, referência (opcional)"
            />
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={!currentPayload || !hasChanges(currentPayload) || isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
