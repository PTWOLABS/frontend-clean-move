import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

export function ResetPasswordInvalidToken() {
  return (
    <>
      <BrandLogo />

      <div className="relative z-10 w-full max-w-105">
        <div className="mt-9 space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10">
            <AlertCircle aria-hidden className="size-8 text-[#F87171]" />
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-[34px] font-bold leading-tight tracking-normal text-[#F8FAFC] sm:text-[38px]">
              Link de recuperação inválido
            </h1>
            <p className="text-sm leading-7 text-[#94A3B8]">
              Este link expirou ou não é válido. Solicite um novo link para redefinir sua senha.
            </p>
          </div>

          <Button
            asChild
            className="h-[52px] w-full rounded-[12px] bg-[#2563EB] text-base font-semibold text-white shadow-[0_18px_42px_rgba(37,99,235,0.28)] transition-colors hover:bg-[#1D4ED8] active:bg-[#1E40AF]"
          >
            <Link href="/forgot-password">Solicitar novo link</Link>
          </Button>

          <p className="text-center text-sm text-[#94A3B8]">
            <Link
              href="/login"
              className="font-medium text-[#3B82F6] transition-colors hover:text-[#60A5FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
            >
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
