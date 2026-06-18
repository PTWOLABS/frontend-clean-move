import { Button } from "@/components/ui/button";
import { DatePickerTime } from "@/components/ui/calendar/date-picker-time";
import { FormField } from "@/components/ui/form/field";
import { FormControl, FormLabel } from "@/components/ui/form/form-primitives";
import { getValidDate } from "@/shared/utils/lib";
import { X } from "lucide-react";
import { Control, FieldValues } from "react-hook-form";

type AppointmentDateFieldProps = {
  control: Control<FieldValues>;
  name: "startsAt" | "endsAt";
  label: string;
  portalContainer?: HTMLElement | null;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  timeInputClassName?: string;
  clearable?: boolean;
};

export function AppointmentDateField({
  control,
  name,
  label,
  disabled = false,
  portalContainer,
  required,
  className,
  timeInputClassName,
  clearable = false,
}: AppointmentDateFieldProps) {
  return (
    <FormField control={control} name={name} className="min-w-0" renderControl={false}>
      {({ field, fieldState }) => {
        const selectedDate = getValidDate(field.value) ?? null;
        const hasValue =
          field.value !== null && field.value !== undefined && String(field.value).length > 0;

        return (
          <>
            <div className="flex min-h-7 items-center justify-between gap-3">
              <FormLabel>
                {label}
                {required && (
                  <span aria-hidden="true" className="ml-1 text-destructive">
                    *
                  </span>
                )}
              </FormLabel>

              {clearable && hasValue ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  aria-label={`Limpar ${label.toLowerCase()}`}
                  className="h-7 shrink-0 border-border/70 bg-background/60 px-2.5 text-xs text-muted-foreground shadow-xs hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    field.onChange(null);
                    field.onBlur();
                  }}
                >
                  <X aria-hidden className="size-3.5" />
                  Limpar
                </Button>
              ) : null}
            </div>

            <FormControl>
              <DatePickerTime
                value={selectedDate}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
                invalid={fieldState.invalid}
                portalContainer={portalContainer}
                placeholder="Selecione data e horário"
                className={className}
                timeInputClassName={timeInputClassName}
              />
            </FormControl>
          </>
        );
      }}
    </FormField>
  );
}
