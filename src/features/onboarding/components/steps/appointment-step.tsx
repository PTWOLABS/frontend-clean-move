"use client";

import { type KeyboardEvent } from "react";
import { CalendarClock, CarFront, type LucideIcon, UserRound, Wrench } from "lucide-react";
import { type Control, type FieldValues, useFormContext } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppointmentDateField } from "@/features/appointments/components/form-sheet/appointment-date-field";
import { cn } from "@/shared/utils/cn";

import type { OnboardingFormValues } from "../../schemas/onboarding-schema";
import { StepHeader } from "./step-header";

type AppointmentStepProps = {
  title: string;
  description: string;
  className?: string;
  customerFullName?: string;
  serviceName?: string;
  vehicleName?: string;
  hasCustomer?: boolean;
  hasService?: boolean;
  hasVehicle?: boolean;
  onCustomerClick?: () => void;
  onServiceClick?: () => void;
  onVehicleClick?: () => void;
};

export function AppointmentStep({
  title,
  description,
  className,
  customerFullName,
  serviceName,
  vehicleName,
  hasCustomer,
  hasService,
  hasVehicle,
  onCustomerClick,
  onServiceClick,
  onVehicleClick,
}: AppointmentStepProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();
  const fieldControl = control as unknown as Control<FieldValues>;

  return (
    <Card className={cn("border-border/70 bg-card/60 shadow-sm backdrop-blur-xl", className)}>
      <StepHeader title={title} description={description} />

      <CardContent className="space-y-5">
        <div className="grid gap-5 md:grid-cols-3">
          <AppointmentResourceInput
            id="onboarding-appointment-customer-name"
            label="Cliente"
            value={customerFullName}
            autoComplete="name"
            icon={UserRound}
            disabled={hasCustomer}
            onClick={onCustomerClick}
            error={errors.customerFullName?.message}
          />

          <AppointmentResourceInput
            id="onboarding-appointment-service-name"
            label="Serviço"
            value={serviceName}
            autoComplete="off"
            icon={Wrench}
            disabled={hasService}
            onClick={onServiceClick}
            error={errors.serviceName?.message}
          />

          <AppointmentResourceInput
            id="onboarding-appointment-vehicle-name"
            label="Veículo"
            value={vehicleName}
            autoComplete="off"
            icon={CarFront}
            disabled={hasVehicle}
            onClick={onVehicleClick}
            error={errors.vehicleModel?.message}
          />
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <AppointmentDateField
              control={fieldControl}
              name="startsAt"
              label="Data de início"
              className="w-full"
              timeInputClassName="w-24 min-[380px]:w-28 shadow-xs"
            />

            <AppointmentDateField
              control={fieldControl}
              name="endsAt"
              label="Data de encerramento"
              className="w-full"
              timeInputClassName="w-24 min-[380px]:w-28"
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            <CalendarClock aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>Se preferir, pule esta etapa e cadastre o primeiro agendamento depois.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type AppointmentResourceInputProps = {
  id: string;
  label: string;
  value?: string;
  autoComplete?: string;
  icon: LucideIcon;
  disabled?: boolean;
  onClick?: () => void;
  error?: string;
};

function AppointmentResourceInput({
  id,
  label,
  value,
  autoComplete,
  icon: Icon,
  disabled,
  onClick,
  error,
}: AppointmentResourceInputProps) {
  const canNavigate = !disabled && Boolean(onClick);
  const errorId = `${id}-error`;

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!canNavigate) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium leading-none text-foreground">
        {label}
      </label>

      <div className="relative">
        <Input
          id={id}
          value={value ?? ""}
          readOnly
          disabled={disabled}
          autoComplete={autoComplete}
          onClick={canNavigate ? onClick : undefined}
          onKeyDown={handleKeyDown}
          aria-readonly="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "pl-9 shadow-xs",
            canNavigate && "cursor-pointer",
            error && "border-destructive/70 focus-visible:ring-destructive/30",
          )}
        />

        <Icon
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>

      {error && (
        <p id={errorId} className="text-[11px] font-medium leading-4 text-destructive md:text-[0.8rem]">
          {error}
        </p>
      )}
    </div>
  );
}
