import { Fragment } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

type RegisterStepsProps = {
  steps: {
    label: string;
  }[];
  activatedStep: number;
};

export function RegisterSteps({ steps, activatedStep }: RegisterStepsProps) {
  return (
    <ol aria-label="Etapas do cadastro" className="mt-5 flex items-start">
      {steps.map((step, index) => {
        const isStepActive = activatedStep === index;
        const isStepCompleted = index < activatedStep;
        const lastStepIndex = steps.length - 1;

        return (
          <Fragment key={step.label}>
            <li className="flex min-w-0 flex-col items-center">
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                  isStepCompleted &&
                    'border-[#22C55E]/40 bg-[#22C55E]/15 text-[#86EFAC]',
                  isStepActive &&
                    'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_0_18px_rgba(37,99,235,0.28)]',
                  !isStepActive &&
                    !isStepCompleted &&
                    'border-[#334155] bg-transparent text-[#94A3B8]',
                )}
              >
                {isStepCompleted ? (
                  <Check aria-hidden className="size-5" />
                ) : (
                  index + 1
                )}
              </span>
              <p
                className={cn(
                  'mt-2 max-w-20 text-center text-[12px] font-medium leading-tight sm:text-sm',
                  isStepActive || isStepCompleted
                    ? 'text-[#F8FAFC]'
                    : 'text-[#94A3B8]',
                )}
              >
                {step.label}
              </p>
            </li>

            {index !== lastStepIndex && (
              <div
                className={cn(
                  'mx-2 mt-[18px] h-px flex-1 rounded-full transition-colors sm:mx-3',
                  isStepCompleted ? 'bg-[#22C55E]/45' : 'bg-[#334155]',
                )}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}
