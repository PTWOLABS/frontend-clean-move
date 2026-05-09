import { type ComponentProps } from "react";
import { type LucideIcon } from "lucide-react";

import { InputField } from "@/components/ui/form/input-field";
import { cn } from "@/shared/utils/cn";

type RegisterTextFieldProps = Omit<ComponentProps<typeof InputField>, "icon" | "className"> & {
  className?: string;
  icon?: LucideIcon;
};

export function RegisterTextField({
  icon: Icon,
  className,
  image,
  imageClassName,
  fieldClassName,
  ...props
}: RegisterTextFieldProps) {
  return (
    <InputField
      {...props}
      image={image}
      imageClassName={cn("right-3 pointer-events-auto", imageClassName)}
      fieldClassName={cn("space-y-1.5", fieldClassName)}
      icon={
        Icon ? (
          <Icon
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#94A3B8]"
          />
        ) : undefined
      }
      className={cn(
        "h-12 rounded-[12px] border-[#243244] bg-[#0E1622]/70 text-[15px] text-[#F8FAFC] shadow-none placeholder:text-[#94A3B8]/75 focus-visible:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB]/30",
        Icon ? "pl-12" : "pl-4",
        image ? "pr-12" : "pr-4",
        className,
      )}
    />
  );
}
