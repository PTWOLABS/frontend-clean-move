"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LoaderCircle } from "lucide-react";
import {
  FormProvider,
  useForm,
  type Control,
  type FieldValues,
  type Resolver,
  type UseFormReset,
  type UseFormSetError,
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
import { StandartInputField } from "@/components/ui/form/standart-input-field";

import {
  passwordConfirmationCodeSchema,
  type PasswordConfirmationCodeFormValues,
} from "../schemas/password-settings-schema";

type ConfirmationFormHelpers = {
  setError: UseFormSetError<PasswordConfirmationCodeFormValues>;
  reset: UseFormReset<PasswordConfirmationCodeFormValues>;
};

type SettingsPasswordConfirmationStepProps = {
  email: string;
  hasPassword: boolean;
  isConfirmPending: boolean;
  isResendPending: boolean;
  onBack: () => void;
  onConfirm: (values: PasswordConfirmationCodeFormValues, helpers: ConfirmationFormHelpers) => void;
  onResendCode: (helpers: ConfirmationFormHelpers) => void;
};

export function SettingsPasswordConfirmationStep({
  email,
  hasPassword,
  isConfirmPending,
  isResendPending,
  onBack,
  onConfirm,
  onResendCode,
}: SettingsPasswordConfirmationStepProps) {
  const methods = useForm<PasswordConfirmationCodeFormValues>({
    resolver: zodResolver(
      passwordConfirmationCodeSchema,
    ) as Resolver<PasswordConfirmationCodeFormValues>,
    defaultValues: { confirmationCode: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { control, handleSubmit, setError, reset } = methods;
  const fieldControl = control as unknown as Control<FieldValues>;
  const isPending = isConfirmPending || isResendPending;
  const helpers = { setError, reset };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {hasPassword ? "Confirmar alteração de senha" : "Confirmar definição de senha"}
        </CardTitle>
        <CardDescription>
          Enviamos um código de 6 dígitos para{" "}
          <span className="font-medium text-foreground">{email}</span>. O código é válido por 15
          minutos.
        </CardDescription>
      </CardHeader>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit((values) => onConfirm(values, helpers))}>
          <CardContent className="space-y-4">
            <StandartInputField
              control={fieldControl}
              name="confirmationCode"
              label="Código de confirmação"
              icon={KeyRound}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
            />

            <p className="text-sm text-muted-foreground">
              Após confirmar, você será deslogado e precisará entrar novamente.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={onBack}
                className="w-full sm:w-auto"
              >
                Voltar
              </Button>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isConfirmPending ? (
                  <>
                    <LoaderCircle aria-hidden className="size-4 animate-spin" />
                    Confirmando...
                  </>
                ) : hasPassword ? (
                  "Confirmar alteração"
                ) : (
                  "Confirmar definição"
                )}
              </Button>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={() => onResendCode(helpers)}
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:opacity-50"
            >
              {isResendPending ? "Reenviando código..." : "Reenviar código"}
            </button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
