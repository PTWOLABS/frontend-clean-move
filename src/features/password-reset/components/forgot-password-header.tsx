import { BrandLogo } from "@/components/brand-logo";

import { PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE } from "../lib/constants";

type ForgotPasswordHeaderProps = {
  isSuccess?: boolean;
};

export function ForgotPasswordHeader({ isSuccess = false }: ForgotPasswordHeaderProps) {
  return (
    <>
      <BrandLogo />

      <div className="mt-10 space-y-3">
        {isSuccess ? (
          <>
            <h1 className="font-display text-[34px] font-bold leading-tight tracking-normal text-[#F8FAFC] sm:text-[38px]">
              Verifique seu e-mail
            </h1>
            <p className="max-w-[360px] text-base leading-7 text-[#94A3B8]">
              {PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE}
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-[34px] font-bold leading-tight tracking-normal text-[#F8FAFC] sm:text-[38px]">
              Esqueceu sua senha?
            </h1>
            <p className="max-w-[360px] text-base leading-7 text-[#94A3B8]">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </>
        )}
      </div>
    </>
  );
}
