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
  required?: boolean;
};

export function AppointmentDateField({
  control,
  name,
  label,
  portalContainer,
  required,
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
            invalid={fieldState.invalid}
            portalContainer={portalContainer}
            placeholder="Selecione data e horário"
          />
        </FormControl>
      )}
    </FormField>
  );
}
