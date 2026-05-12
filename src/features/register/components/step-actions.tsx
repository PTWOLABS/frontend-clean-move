import { ArrowLeft, LoaderCircle } from "lucide-react";
import { type FieldValues, useFormContext, useWatch } from "react-hook-form";
import { type ZodType } from "zod";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";

type StepActionsProps<TValues extends FieldValues> = {
  submitLabel: string;
  schema: ZodType;
  disabled?: boolean;
  /** Mostra spinner no botão de enviar (ex.: mutation em curso). */
  submitBusy?: boolean;
  onBack?: (values: TValues) => void;
};

export function StepActions<TValues extends FieldValues>({
  submitLabel,
  schema,
  disabled = false,
  submitBusy = false,
  onBack,
}: StepActionsProps<TValues>) {
  const {
    formState: { errors, isSubmitting },
    control,
    getValues,
  } = useFormContext<TValues>();
  const values = useWatch({ control });
  const isStepValid = schema.safeParse(values).success;
  const hasErrors = Object.keys(errors).length > 0;
  const showSubmitSpinner = isSubmitting || submitBusy;

  return (
    <div
      className={cn(
        "grid gap-3",
        onBack && "flex flex-col-reverse sm:grid sm:grid-cols-[0.82fr_1.18fr]",
      )}
    >
      {onBack ? (
        <Button
          disabled={disabled || isSubmitting}
          type="button"
          variant="outline"
          onClick={() => onBack(getValues())}
          className="h-[52px] w-full rounded-[12px] border-[#243244] bg-[#111B28]/65 text-base font-semibold text-[#F8FAFC] shadow-none transition-colors hover:bg-[#192333] hover:text-[#F8FAFC]"
        >
          <ArrowLeft aria-hidden className="size-5" />
          Voltar
        </Button>
      ) : null}

      <Button
        disabled={disabled || !isStepValid || hasErrors || isSubmitting || submitBusy}
        type="submit"
        aria-busy={showSubmitSpinner}
        className="h-[52px] w-full rounded-[12px] bg-[#2563EB] text-base font-semibold text-white shadow-[0_18px_42px_rgba(37,99,235,0.28)] transition-colors hover:bg-[#1D4ED8] active:bg-[#1E40AF]"
      >
        <span className="inline-flex items-center justify-center gap-2">
          {showSubmitSpinner ? (
            <LoaderCircle
              role="status"
              aria-label="A enviar"
              className="size-5 shrink-0 animate-spin text-white"
            />
          ) : null}
          {submitLabel}
        </span>
      </Button>
    </div>
  );
}
