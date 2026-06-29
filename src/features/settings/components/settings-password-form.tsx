"use client";

import { useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import {
  FormProvider,
  useForm,
  type Control,
  type FieldValues,
  type Resolver,
} from "react-hook-form";

import { AlertDialog } from "@/components/ui/alert-dialog/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StandartInputField } from "@/components/ui/form/standart-input-field";
import { handlePasswordUpdateError } from "@/features/user/lib/handle-password-update-error";
import { useUpdateUserPassword } from "@/features/user/hooks/use-update-user-password";
import type { User, UpdateUserPasswordResponse } from "@/features/user/types";
import { ApiError } from "@/shared/api/httpClient";

import {
  createPasswordSettingsSchema,
  getPasswordSettingsDefaultValues,
  mapPasswordFormToApiPayload,
  type PasswordSettingsFormValues,
} from "../schemas/password-settings-schema";

type SettingsPasswordFormProps = {
  user: User;
};

type PasswordFieldToggleProps = {
  visible: boolean;
  onToggle: () => void;
};

function PasswordFieldToggle({ visible, onToggle }: PasswordFieldToggleProps) {
  return (
    <button
      type="button"
      aria-label={visible ? "Ocultar senha" : "Exibir senha"}
      onClick={onToggle}
      className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
    >
      {visible ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
    </button>
  );
}

export function SettingsPasswordForm({ user }: SettingsPasswordFormProps) {
  const hasPassword = Boolean(user.hasPassword);
  const { socialAccounts } = user;
  const { mutate, isPending, finalizeSessionCleanup } = useUpdateUserPassword();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const validationSchema = useMemo(() => createPasswordSettingsSchema(hasPassword), [hasPassword]);

  const methods = useForm<PasswordSettingsFormValues>({
    resolver: zodResolver(validationSchema) as Resolver<PasswordSettingsFormValues>,
    defaultValues: getPasswordSettingsDefaultValues(hasPassword),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { control, getValues, handleSubmit, setError } = methods;
  const fieldControl = control as unknown as Control<FieldValues>;

  const title = hasPassword ? "Alterar senha" : "Definir senha";
  const description = hasPassword
    ? "Atualize a senha usada para entrar com e-mail e senha."
    : socialAccounts.length > 0
      ? "Crie uma senha local para entrar com e-mail e senha. Você também pode continuar entrando com Google."
      : "Crie uma senha para entrar com e-mail e senha.";

  const onSubmit = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmPasswordUpdate = () => {
    const parsed = validationSchema.safeParse(getValues());

    if (!parsed.success) {
      toast.error("Verifique os dados do formulário.");
      setConfirmDialogOpen(false);
      return;
    }

    mutate(mapPasswordFormToApiPayload(parsed.data, hasPassword), {
      onError: (error: ApiError | Error) => {
        handlePasswordUpdateError(error, {
          setError,
          onUnauthorized: finalizeSessionCleanup,
        });
        setConfirmDialogOpen(false);
      },
      onSettled: (
        _data: UpdateUserPasswordResponse | undefined,
        error: ApiError | Error | null,
      ) => {
        if (!error) {
          setConfirmDialogOpen(false);
        }
      },
    });
  };

  const handleCancelPasswordUpdate = () => {
    setConfirmDialogOpen(false);
  };

  const handleConfirmDialogOpenChange = (open: boolean) => {
    if (isPending) {
      return;
    }

    setConfirmDialogOpen(open);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {hasPassword ? (
                <StandartInputField
                  control={fieldControl}
                  name="currentPassword"
                  label="Senha atual"
                  icon={LockKeyhole}
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  imageClassName="pointer-events-auto"
                  image={
                    <PasswordFieldToggle
                      visible={showCurrentPassword}
                      onToggle={() => setShowCurrentPassword((current) => !current)}
                    />
                  }
                />
              ) : null}

              <StandartInputField
                control={fieldControl}
                name="newPassword"
                label="Nova senha"
                icon={LockKeyhole}
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                imageClassName="pointer-events-auto"
                image={
                  <PasswordFieldToggle
                    visible={showNewPassword}
                    onToggle={() => setShowNewPassword((current) => !current)}
                  />
                }
              />

              <StandartInputField
                control={fieldControl}
                name="confirmPassword"
                label="Confirmar nova senha"
                icon={LockKeyhole}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                imageClassName="pointer-events-auto"
                image={
                  <PasswordFieldToggle
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((current) => !current)}
                  />
                }
              />

              <p className="text-sm text-muted-foreground">
                Após salvar, você será deslogado e precisará entrar novamente.
              </p>
            </CardContent>

            <CardFooter>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? "Salvando..." : hasPassword ? "Alterar senha" : "Definir senha"}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>

      <AlertDialog
        open={confirmDialogOpen}
        onOpenChange={handleConfirmDialogOpenChange}
        title={hasPassword ? "Confirmar alteração de senha?" : "Confirmar definição de senha?"}
        descriptionContent="Você será deslogado após esta ação e precisará entrar novamente com sua nova senha ou com Google, se aplicável."
        actionMessage={hasPassword ? "Alterar senha" : "Definir senha"}
        isLoading={isPending}
        onConfirm={handleConfirmPasswordUpdate}
        onCancel={handleCancelPasswordUpdate}
      />
    </>
  );
}
