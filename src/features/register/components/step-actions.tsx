import { ArrowLeft } from 'lucide-react';
import { type FieldValues, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { cn } from '@/shared/utils/cn';

type StepActionsProps<TValues extends FieldValues> = {
  submitLabel: string;
  onBack?: (values: TValues) => void;
};

export function StepActions<TValues extends FieldValues>({
  submitLabel,
  onBack,
}: StepActionsProps<TValues>) {
  const {
    formState: { isSubmitting },
    getValues,
  } = useFormContext<TValues>();

  return (
    <div
      className={cn(
        'grid gap-3',
        onBack && 'flex flex-col-reverse sm:grid sm:grid-cols-[0.82fr_1.18fr]',
      )}
    >
      {onBack ? (
        <Button
          disabled={isSubmitting}
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
        disabled={isSubmitting}
        type="submit"
        className="h-[52px] w-full rounded-[12px] bg-[#2563EB] text-base font-semibold text-white shadow-[0_18px_42px_rgba(37,99,235,0.28)] transition-colors hover:bg-[#1D4ED8] active:bg-[#1E40AF]"
      >
        {submitLabel}
      </Button>
    </div>
  );
}
