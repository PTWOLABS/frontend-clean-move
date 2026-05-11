import Image from "next/image";
import logoIcon from "@/assets/logo-icon.svg";

export function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <Image src={logoIcon} alt="" aria-hidden width={50} height={44} className="h-11 w-[40px]" />
      <div className="font-display text-[24px] font-semibold leading-none tracking-normal text-[#F8FAFC]">
        Clean<span className="text-[#2563EB]">Move</span>
      </div>
    </div>
  );
}
