"use client";

import Link from "next/link";
import { LoaderCircle, Mail, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RegisterTextField } from "@/features/register/components/register-text-field";
import { Form } from "@/shared/forms/form";

import {
  PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE,
} from "../lib/constants";
import { useRequestPasswordReset } from "../hooks/use-request-password-reset";
import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "../schemas/forgot-password-schema";

export function ForgotPasswordForm() {
  const { mutate, isPending, isSuccess, reset } = useRequestPasswordReset();

  const onSubmit = (data: ForgotPasswordFormValues) => {
    mutate(data);
  };

  if (isSuccess) {
    return (
      <div className="relative z-10 w-full max-w-105">
        <div
          aria-live="polite"
          className="mt-9 space-y-6 text-center"
        >
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10">
            <MailCheck aria-hidden className="size-8 text-[#38BDF8]" />
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[#F8FAFC]">
              Verifique seu e-mail
            </h2>
            <p className="text-sm leading-7 text-[#94A3B8]">
              {PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE}
            </p>
          </div>

          <Button
            asChild
            className="h-[52px] w-full rounded-[12px] bg-[#2563EB] text-base font-semibold text-white shadow-[0_18px_42px_rgba(37,99,235,0.28)] transition-colors hover:bg-[#1D4ED8] active:bg-[#1E40AF]"
          >
            <Link href="/login">Voltar ao login</Link>
          </Button>

          <button
            type="button"
            onClick={() => reset()}
            className="text-sm font-medium text-[#3B82F6] transition-colors hover:text-[#60A5FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
          >
            Não recebeu? Enviar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-105">
      <Form className="mt-9 space-y-6" onSubmit={onSubmit} schema={forgotPasswordSchema}>
        <RegisterTextField
          id="forgot-password-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          label="E-mail"
          icon={Mail}
        />

        <Button
          disabled={isPending}
          aria-busy={isPending}
          type="submit"
          className="h-[52px] w-full rounded-[12px] bg-[#2563EB] text-base font-semibold text-white shadow-[0_18px_42px_rgba(37,99,235,0.28)] transition-colors hover:bg-[#1D4ED8] active:bg-[#1E40AF]"
        >
          {isPending ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
          Enviar link de recuperação
        </Button>
      </Form>

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
