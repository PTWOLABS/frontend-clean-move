import { DatePickerTime } from "@/components/ui/calendar/date-picker-time";
import { FormField } from "@/components/ui/form/field";
import { FormControl } from "@/components/ui/form/form-primitives";
import { getValidDate } from "@/shared/utils/lib";
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
}: AppointmentDateFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      required={required}
      renderControl={false}
    >
      {({ field, fieldState }) => (
        <FormControl>
          <DatePickerTime
            value={getValidDate(field.value) ?? null}
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
      )}
    </FormField>
  );
}
