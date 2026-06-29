"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { FormProvider, useForm, type Control, type FieldValues } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { RegisterTextField } from "@/features/register/components/register-text-field";

import { handlePasswordResetConfirmError } from "../lib/handle-password-reset-confirm-error";
import {
  isInvalidPasswordResetTokenError,
  useConfirmPasswordReset,
} from "../hooks/use-confirm-password-reset";
import {
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from "../schemas/reset-password-schema";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const methods = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { control, handleSubmit, setError } = methods;
  const fieldControl = control as unknown as Control<FieldValues>;

  const { mutate, isPending, error, reset: resetMutation } = useConfirmPasswordReset();

  const onSubmit = (data: ResetPasswordFormValues) => {
    resetMutation();
    mutate(
      { ...data, token },
      {
        onError: (submitError) => {
          handlePasswordResetConfirmError(submitError, setError);
        },
      },
    );
  };

  const hasInvalidTokenError = isInvalidPasswordResetTokenError(error);

  return (
    <div className="relative z-10 w-full max-w-105">
      {hasInvalidTokenError ? (
        <div
          role="alert"
          className="mt-9 rounded-[12px] border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm leading-6 text-[#FCA5A5]"
        >
          Link inválido ou expirado.{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-[#3B82F6] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
          >
            Solicite um novo link de recuperação
          </Link>
          .
        </div>
      ) : null}

      <FormProvider {...methods}>
        <form className="mt-9 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <RegisterTextField
            control={fieldControl}
            id="reset-password-new"
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            label="Nova senha"
            icon={LockKeyhole}
            image={
              <button
                type="button"
                aria-label={showNewPassword ? "Ocultar senha" : "Exibir senha"}
                onClick={() => setShowNewPassword((current) => !current)}
                className="inline-flex size-9 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#192333] hover:text-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
              >
                {showNewPassword ? (
                  <EyeOff aria-hidden className="size-5" />
                ) : (
                  <Eye aria-hidden className="size-5" />
                )}
              </button>
            }
          />

          <RegisterTextField
            control={fieldControl}
            id="reset-password-confirm"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            label="Confirmar nova senha"
            icon={LockKeyhole}
            image={
              <button
                type="button"
                aria-label={showConfirmPassword ? "Ocultar senha" : "Exibir senha"}
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="inline-flex size-9 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#192333] hover:text-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
              >
                {showConfirmPassword ? (
                  <EyeOff aria-hidden className="size-5" />
                ) : (
                  <Eye aria-hidden className="size-5" />
                )}
              </button>
            }
          />

          <Button
            disabled={isPending}
            aria-busy={isPending}
            type="submit"
            className="h-[52px] w-full rounded-[12px] bg-[#2563EB] text-base font-semibold text-white shadow-[0_18px_42px_rgba(37,99,235,0.28)] transition-colors hover:bg-[#1D4ED8] active:bg-[#1E40AF]"
          >
            {isPending ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
            Redefinir senha
          </Button>
        </form>
      </FormProvider>

      <p className="mt-9 text-center text-sm text-[#94A3B8]">
        <Link
          href="/login"
          className="font-medium text-[#3B82F6] transition-colors hover:text-[#60A5FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
        >
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
