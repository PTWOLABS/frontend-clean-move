import { BrandLogo } from "@/components/brand-logo";

type RegisterHeaderProps = {
  title: string;
  description: string;
};

export function RegisterHeader({ title, description }: RegisterHeaderProps) {
  return (
    <>
      <BrandLogo />

      <div className="mt-3 space-y-2.5">
        <h1 className="font-display text-[34px] font-bold leading-tight tracking-normal text-[#F8FAFC] sm:text-[38px]">
          {title}
        </h1>
        <p className="max-w-[380px] text-base leading-6 text-[#94A3B8]">{description}</p>
      </div>
    </>
  );
}
