import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/google-icon";
import { RegisterTextField } from "./register-text-field";
import { StepActions } from "./step-actions";
import { accountStepSchema, type AccountStepValues } from "../schemas/register-schema";

export function AccountStep() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-[52px] w-full rounded-[12px] border-[#243244] bg-[#111B28]/65 text-base font-semibold text-[#F8FAFC] shadow-none transition-colors hover:bg-[#192333] hover:text-[#F8FAFC]"
      >
        <GoogleIcon />
        Continuar com Google
      </Button>

      <div className="flex items-center gap-5 text-sm text-[#94A3B8]">
        <div className="h-px flex-1 bg-[#243244]" />
        <span>ou</span>
        <div className="h-px flex-1 bg-[#243244]" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <RegisterTextField
          id="register-full-name"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Seu nome completo"
          label="Nome completo"
          icon={UserRound}
        />

        <RegisterTextField
          id="register-phone"
          name="phone"
          type="tel"
          mask="(__) _____-____"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(00) 00000-0000"
          label="Telefone"
          icon={Phone}
        />

        <RegisterTextField
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          label="E-mail"
          icon={Mail}
          fieldClassName="sm:col-span-2"
        />

        <RegisterTextField
          id="register-password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          label="Senha"
          placeholder="Mínimo de 8 caracteres"
          icon={LockKeyhole}
          fieldClassName="sm:col-span-2"
          image={
            <button
              type="button"
              aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
              onClick={() => setShowPassword((current) => !current)}
              className="inline-flex size-9 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#192333] hover:text-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
            >
              {showPassword ? (
                <EyeOff aria-hidden className="size-5" />
              ) : (
                <Eye aria-hidden className="size-5" />
              )}
            </button>
          }
        />
      </div>

      <StepActions<AccountStepValues> schema={accountStepSchema} submitLabel="Continuar" />
    </>
  );
}
