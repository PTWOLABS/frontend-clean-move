import { type ComponentProps } from "react";
import { type LucideIcon } from "lucide-react";

import { InputField } from "@/components/ui/form/input-field";
import { cn } from "@/shared/utils/cn";

type SettingsInputFieldProps = Omit<ComponentProps<typeof InputField>, "icon" | "className"> & {
  className?: string;
  icon?: LucideIcon;
};

export function SettingsInputField({
  icon: Icon,
  className,
  fieldClassName,
  ...props
}: SettingsInputFieldProps) {
  return (
    <InputField
      {...props}
      fieldClassName={fieldClassName}
      icon={
        Icon ? (
          <Icon
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        ) : undefined
      }
      className={cn(Icon ? "pl-9" : undefined, className)}
    />
  );
}
