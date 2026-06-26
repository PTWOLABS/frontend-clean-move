import { BrandLogo } from "@/components/brand-logo";

export function ResetPasswordHeader() {
  return (
    <>
      <BrandLogo />

      <div className="mt-10 space-y-3">
        <h1 className="font-display text-[34px] font-bold leading-tight tracking-normal text-[#F8FAFC] sm:text-[38px]">
          Crie uma nova senha
        </h1>
        <p className="max-w-[360px] text-base leading-7 text-[#94A3B8]">
          Escolha uma senha segura. O link de recuperação expira em 15 minutos.
        </p>
      </div>
    </>
  );
}
