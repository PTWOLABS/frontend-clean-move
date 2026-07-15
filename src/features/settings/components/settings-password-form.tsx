"use client";

import { useCallback, useMemo, useState } from "react";

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
import { DiscardChangesButton } from "@/components/ui/form/discard-changes-button";
import { StandartInputField } from "@/components/ui/form/standart-input-field";
import { handlePasswordUpdateError } from "@/features/user/lib/handle-password-update-error";
import { useRequestPasswordChangeCode } from "@/features/user/hooks/use-request-password-change-code";
import { useUpdateUserPassword } from "@/features/user/hooks/use-update-user-password";
import type { RequestPasswordChangeCodePayload, User } from "@/features/user/types";
import { ApiError } from "@/shared/api/httpClient";

import { useSettingsPasswordTabGuard } from "../hooks/use-settings-password-tab-guard";
import {
  buildConfirmPasswordChangePayload,
  createPasswordSettingsSchema,
  getPasswordSettingsDefaultValues,
  mapPasswordFormToCodeRequestPayload,
  type PasswordConfirmationCodeFormValues,
  type PasswordSettingsFormValues,
} from "../schemas/password-settings-schema";
import { SettingsPasswordConfirmationStep } from "./settings-password-confirmation-step";

type SettingsPasswordFormProps = {
  user: User;
};

type PasswordChangeStep = "credentials" | "confirmation";

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

  const [step, setStep] = useState<PasswordChangeStep>("credentials");
  const [pendingPayload, setPendingPayload] = useState<RequestPasswordChangeCodePayload | null>(
    null,
  );
  const [confirmationFormKey, setConfirmationFormKey] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { mutate: requestPasswordChangeCode, isPending: isRequestPasswordChangeCodePending } =
    useRequestPasswordChangeCode();
  const {
    mutate: confirmPasswordChange,
    isPending: isConfirmPasswordPending,
    finalizeSessionCleanup,
  } = useUpdateUserPassword();

  const validationSchema = useMemo(() => createPasswordSettingsSchema(hasPassword), [hasPassword]);

  const methods = useForm<PasswordSettingsFormValues>({
    resolver: zodResolver(validationSchema) as Resolver<PasswordSettingsFormValues>,
    defaultValues: getPasswordSettingsDefaultValues(hasPassword),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const {
    control,
    getValues,
    handleSubmit,
    setError,
    reset,
    formState: { isDirty },
  } = methods;
  const fieldControl = control as unknown as Control<FieldValues>;

  const title = hasPassword ? "Alterar senha" : "Definir senha";
  const description = hasPassword
    ? "Atualize a senha usada para entrar com e-mail e senha."
    : socialAccounts.length > 0
      ? "Crie uma senha local para entrar com e-mail e senha. Você também pode continuar entrando com Google."
      : "Crie uma senha para entrar com e-mail e senha.";

  const handlePasswordFieldError = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      return;
    }

    setStep("credentials");
    setConfirmDialogOpen(false);

    handlePasswordUpdateError(error, {
      setError,
      onUnauthorized: finalizeSessionCleanup,
    });
  };

  const handleRequestCodeSuccess = (payload: RequestPasswordChangeCodePayload) => {
    setPendingPayload(payload);
    setStep("confirmation");
    setConfirmationFormKey((current) => current + 1);
    setConfirmDialogOpen(false);
  };

  const handleConfirmSendCode = () => {
    const parsed = validationSchema.safeParse(getValues());

    if (!parsed.success) {
      toast.error("Verifique os dados do formulário.");
      setConfirmDialogOpen(false);
      return;
    }

    const payload = mapPasswordFormToCodeRequestPayload(parsed.data, hasPassword);

    requestPasswordChangeCode(payload, {
      onSuccess: () => handleRequestCodeSuccess(payload),
      onError: (error: ApiError | Error) => {
        handlePasswordUpdateError(error, {
          setError,
          onUnauthorized: finalizeSessionCleanup,
        });
        setConfirmDialogOpen(false);
      },
    });
  };

  const handleConfirmPasswordChange = (
    values: PasswordConfirmationCodeFormValues,
    setConfirmationError: ReturnType<
      typeof useForm<PasswordConfirmationCodeFormValues>
    >["setError"],
  ) => {
    if (!pendingPayload) {
      toast.error("Solicite um novo código antes de confirmar.");
      setStep("credentials");
      return;
    }

    confirmPasswordChange(
      buildConfirmPasswordChangePayload(pendingPayload, values.confirmationCode),
      {
        onError: (error: ApiError | Error) => {
          handlePasswordUpdateError(error, {
            setConfirmationError,
            onUnauthorized: finalizeSessionCleanup,
            onPasswordFieldError: () => handlePasswordFieldError(error),
          });
        },
      },
    );
  };

  const handleResendCode = (
    setConfirmationError: ReturnType<
      typeof useForm<PasswordConfirmationCodeFormValues>
    >["setError"],
    resetConfirmationForm: ReturnType<typeof useForm<PasswordConfirmationCodeFormValues>>["reset"],
  ) => {
    if (!pendingPayload) {
      setStep("credentials");
      return;
    }

    requestPasswordChangeCode(pendingPayload, {
      onSuccess: () => {
        resetConfirmationForm({ confirmationCode: "" });
      },
      onError: (error: ApiError | Error) => {
        handlePasswordUpdateError(error, {
          setConfirmationError,
          onUnauthorized: finalizeSessionCleanup,
          onPasswordFieldError: () => handlePasswordFieldError(error),
        });
      },
    });
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
  };

  const onSubmit = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialogOpenChange = (open: boolean) => {
    if (isRequestPasswordChangeCodePending) {
      return;
    }

    setConfirmDialogOpen(open);
  };

  const discardPasswordChanges = useCallback(() => {
    reset(getPasswordSettingsDefaultValues(hasPassword));
    setPendingPayload(null);
    setStep("credentials");
    setConfirmDialogOpen(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, [hasPassword, reset]);

  useSettingsPasswordTabGuard({
    isDirty,
    step,
    confirmDialogOpen,
    isSaving: isRequestPasswordChangeCodePending || isConfirmPasswordPending,
    handleSubmit,
    onOpenConfirmDialog: () => setConfirmDialogOpen(true),
    onDiscard: discardPasswordChanges,
  });

  if (step === "confirmation" && pendingPayload) {
    return (
      <SettingsPasswordConfirmationStep
        key={confirmationFormKey}
        email={user.email}
        hasPassword={hasPassword}
        isConfirmPending={isConfirmPasswordPending}
        isResendPending={isRequestPasswordChangeCodePending}
        onBack={handleBackToCredentials}
        onConfirm={(values, helpers) => handleConfirmPasswordChange(values, helpers.setError)}
        onResendCode={(helpers) => handleResendCode(helpers.setError, helpers.reset)}
      />
    );
  }

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
                Após confirmar, você será deslogado e precisará entrar novamente.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <DiscardChangesButton
                disabled={!isDirty || isRequestPasswordChangeCodePending}
                onClick={discardPasswordChanges}
              />
              <Button
                type="submit"
                disabled={isRequestPasswordChangeCodePending}
                className="w-full sm:w-auto"
              >
                {isRequestPasswordChangeCodePending ? "Enviando código..." : "Enviar código"}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>

      <AlertDialog
        open={confirmDialogOpen}
        onOpenChange={handleConfirmDialogOpenChange}
        title="Enviar código de confirmação?"
        descriptionContent={
          <>
            Enviaremos um código de confirmação para{" "}
            <span className="font-medium text-foreground">{user.email}</span>. Deseja continuar?
          </>
        }
        actionMessage="Enviar código"
        isLoading={isRequestPasswordChangeCodePending}
        onConfirm={handleConfirmSendCode}
        onCancel={() => setConfirmDialogOpen(false)}
      />
    </>
  );
}
