"use client";

import { useCallback, useEffect, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Hash, LoaderCircle, Mail, MapPin, Navigation, Phone, User } from "lucide-react";
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
import { InputField } from "@/components/ui/form/input-field";
import { PHONE_MASK, ZIP_CODE_MASK } from "@/shared/constants/input-masks";
import { useZipCodeAutofill, type ZipCodeAutofillForm } from "@/shared/hooks/use-zipcode-autofill";
import { useUpdateUserProfile } from "@/features/user/hooks/use-update-user-profile";
import type { User as UserProfile } from "@/features/user/types";

import { useRegisterSettingsUnsavedChanges } from "../context/settings-unsaved-changes-context";
import {
  canSaveProfileSettings,
  createProfileSettingsSchema,
  getProfileChangedPayload,
  hasProfileChanges,
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

  const initialPayload = useMemo(() => {
    const defaults = mapUserToProfileFormDefaults(user);
    const parsed = profileSettingsSchema.safeParse(defaults);
    return parsed.success ? mapProfileFormToPatchPayload(parsed.data) : null;
  }, [user]);

  const validationSchema = useMemo(
    () => createProfileSettingsSchema(initialPayload),
    [initialPayload],
  );

  const methods = useForm<ProfileSettingsFormInput, undefined, ProfileSettingsFormValues>({
    resolver: zodResolver(validationSchema) as Resolver<
      ProfileSettingsFormInput,
      undefined,
      ProfileSettingsFormValues
    >,
    defaultValues: profileSettingsDefaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { control, handleSubmit, reset, clearErrors, getValues, setError, setValue } = methods;
  const fieldControl = control as unknown as Control<FieldValues>;

  const watchedValues = useWatch({ control });
  const canSave = useMemo(
    () => canSaveProfileSettings(watchedValues, initialPayload),
    [watchedValues, initialPayload],
  );

  const zipCodeAutofillForm = {
    clearErrors,
    control: fieldControl,
    getValues,
    setError,
    setValue,
  } as unknown as ZipCodeAutofillForm;

  const { isFetchingAddress, hasAddressFetchError, zipCodeNotFound } = useZipCodeAutofill(
    zipCodeAutofillForm,
    {
      zipCode: "address.zipCode",
      street: "address.street",
      city: "address.city",
      state: "address.state",
      complement: "address.complement",
    },
  );

  useEffect(() => {
    reset(mapUserToProfileFormDefaults(user));
  }, [user, reset]);

  const persistProfile = useCallback(
    (values: ProfileSettingsFormValues) => {
      const payload = mapProfileFormToPatchPayload(values);

      if (!hasProfileChanges(payload, initialPayload)) {
        return Promise.resolve(true);
      }

      return new Promise<boolean>((resolve) => {
        mutate(getProfileChangedPayload(payload, initialPayload), {
          onSuccess: (updatedUser) => {
            reset(mapUserToProfileFormDefaults(updatedUser));
            resolve(true);
          },
          onError: () => resolve(false),
        });
      });
    },
    [initialPayload, mutate, reset],
  );

  const onSubmit = (values: ProfileSettingsFormValues) => {
    void persistProfile(values);
  };

  const saveFromTabGuard = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      void handleSubmit(
        async (values) => {
          resolve(await persistProfile(values));
        },
        () => resolve(false),
      )();
    });
  }, [handleSubmit, persistProfile]);

  const discardFromTabGuard = useCallback(() => {
    reset(mapUserToProfileFormDefaults(user));
  }, [reset, user]);

  useRegisterSettingsUnsavedChanges("profile", {
    hasUnsavedChanges: canSave,
    isSaving: isPending,
    save: saveFromTabGuard,
    discard: discardFromTabGuard,
  });

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

            {isFetchingAddress || hasAddressFetchError || zipCodeNotFound ? (
              <p className="text-xs text-muted-foreground">
                {isFetchingAddress
                  ? "Buscando endereço pelo CEP..."
                  : zipCodeNotFound
                    ? "CEP não encontrado. Preencha o endereço manualmente."
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

          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={!canSave || isPending}
              className="w-full sm:w-auto"
              onClick={discardFromTabGuard}
            >
              Descartar alterações
            </Button>
            <Button type="submit" disabled={!canSave || isPending} className="w-full sm:w-auto">
              {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
