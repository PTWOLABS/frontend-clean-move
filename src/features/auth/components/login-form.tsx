"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { cn } from "@/shared/utils/cn";
import { Form } from "@/shared/forms/form";
import { InputField } from "@/components/ui/form/input-field";
import { LoginFormValues, loginSchema } from "../schemas/login-schema";
import { useLogin } from "../hooks/use-login";
import { useGoogleLogin } from "../hooks/use-google-login";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { mutate: login, isPending: isLoginLoading } = useLogin();
  const { mutate: googleLogin, isPending: isGoogleLoading } = useGoogleLogin();

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className="relative z-10 w-full max-w-[420px]">
      <Form className="mt-9 space-y-6" onSubmit={onSubmit} schema={loginSchema}>
        <div className="space-y-2.5">
          <InputField
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            label="E-mail"
            icon={
              <Mail
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#94A3B8]"
              />
            }
            className="h-12 rounded-[12px] border-[#243244] bg-[#0E1622]/70 pl-12 pr-4 text-[15px] text-[#F8FAFC] shadow-none placeholder:text-[#94A3B8]/75 focus-visible:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB]/30"
          />
        </div>

        <div className="space-y-2.5">
          <InputField
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            label="Senha"
            placeholder="••••••••"
            icon={
              <LockKeyhole
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#94A3B8]"
              />
            }
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
            imageClassName="right-3 pointer-events-auto"
            className="h-12 rounded-[12px] border-[#243244] bg-[#0E1622]/70 pl-12 pr-12 text-[15px] text-[#F8FAFC] shadow-none placeholder:text-[#94A3B8]/75 focus-visible:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB]/30"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label
            htmlFor="remember"
            className="group inline-flex cursor-pointer items-center gap-3 text-[#F8FAFC]"
          >
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "flex size-5 items-center justify-center rounded-[5px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#2563EB]/35",
                rememberMe
                  ? "border-[#2563EB] bg-[#2563EB]/20 text-[#38BDF8]"
                  : "border-[#334155] bg-[#0E1622]",
              )}
            >
              {rememberMe ? <Check className="size-4" /> : null}
            </span>
            Lembrar-me
          </label>

          <Link
            href="/recuperar-senha"
            className="font-medium text-[#3B82F6] transition-colors hover:text-[#60A5FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button
          disabled={isLoginLoading}
          aria-busy={isLoginLoading}
          type="submit"
          className="h-[52px] w-full rounded-[12px] bg-[#2563EB] text-base font-semibold text-white shadow-[0_18px_42px_rgba(37,99,235,0.28)] transition-colors hover:bg-[#1D4ED8] active:bg-[#1E40AF]"
        >
          {isLoginLoading ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
          Entrar
        </Button>

        <div className="flex items-center gap-5 text-sm text-[#94A3B8]">
          <div className="h-px flex-1 bg-[#243244]" />
          <span>ou</span>
          <div className="h-px flex-1 bg-[#243244]" />
        </div>

        <GoogleSignInButton
          label="Entrar com Google"
          testId="google-signin-slot"
          isLoading={isGoogleLoading}
          onCredential={(credential) => googleLogin({ idToken: credential })}
        />
      </Form>

      <p className="mt-9 text-center text-sm text-[#94A3B8]">
        Não tem conta?{" "}
        <Link
          href="/register"
          className="font-medium text-[#3B82F6] transition-colors hover:text-[#60A5FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
        >
          Cadastrar-se
        </Link>
      </p>
    </div>
  );
}
