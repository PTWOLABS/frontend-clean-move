import { cn } from "@/shared/utils/cn";
import {
  SelectContent,
  SelectItem,
  Select as SelectPrimitive,
  SelectTrigger,
  SelectValue,
} from "./primitives";

type SelectOption<TValue extends string> = {
  label: string;
  value: TValue;
  disabled?: boolean;
};

type SelectProps<TValue extends string> = {
  value?: TValue;
  onChange: (value: TValue) => void;
  options: SelectOption<TValue>[];
  placeholder?: string;
  className?: string;
};

export function Select<TValue extends string>({
  value,
  onChange,
  options,
  placeholder,
  className,
}: SelectProps<TValue>) {
  return (
    <SelectPrimitive value={value} onValueChange={(nextValue) => onChange(nextValue as TValue)}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectPrimitive>
  );
}
