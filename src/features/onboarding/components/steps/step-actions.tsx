"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { FieldPath, useFormContext } from "react-hook-form";

import type { OnboardingFormValues } from "../../schemas/onboarding-schema";

const companyStepFieldNames = [
  "cnpj",
  "legalName",
  "tradeName",
] as const satisfies readonly FieldPath<OnboardingFormValues>[];

const serviceStepFieldNames = [
  "name",
  "description",
  "category",
  "minDurationInMinutes",
  "maxDurationInMinutes",
  "price",
  "isActive",
] as const satisfies readonly FieldPath<OnboardingFormValues>[];

const customerVehicleStepFieldNames = [
  "customerFullName",
  "customerPhone",
  "customerEmail",
  "vehiclePlate",
  "vehicleModel",
  "vehicleColor",
] as const satisfies readonly FieldPath<OnboardingFormValues>[];

const appointmentStepFieldNames = [
  "customerId",
  "serviceIds",
  "vehicleId",
  "startsAt",
] as const satisfies readonly FieldPath<OnboardingFormValues>[];

const stepFieldNames = [
  companyStepFieldNames,
  serviceStepFieldNames,
  customerVehicleStepFieldNames,
  appointmentStepFieldNames,
] as const;

const companyStepDefaultValues = {
  cnpj: "",
  legalName: "",
  tradeName: "",
} satisfies Partial<OnboardingFormValues>;

const serviceStepDefaultValues = {
  name: "",
  description: "",
  category: "",
  minDurationInMinutes: "",
  maxDurationInMinutes: "",
  price: "",
  isActive: false,
} satisfies Partial<OnboardingFormValues>;

const customerVehicleStepDefaultValues = {
  customerFullName: "",
  customerPhone: "",
  customerEmail: "",
  vehiclePlate: "",
  vehicleModel: "",
  vehicleColor: "",
} satisfies Partial<OnboardingFormValues>;

const appointmentStepDefaultValues = {
  customerId: "",
  serviceIds: [],
  vehicleId: "",
  startsAt: null,
} satisfies Partial<OnboardingFormValues>;

const stepDefaultValues = [
  companyStepDefaultValues,
  serviceStepDefaultValues,
  customerVehicleStepDefaultValues,
  appointmentStepDefaultValues,
] as const;

type StepActionsProps = {
  step: number;
  lastStep: number;
  backStep: () => void;
};

export function StepActions({ step, lastStep, backStep }: StepActionsProps) {
  const {
    getValues,
    reset,
    clearErrors,
    formState: { isSubmitting },
  } = useFormContext<OnboardingFormValues>();

  const currentStepIndex = step - 1;
  const currentStepFieldNames = stepFieldNames[currentStepIndex];

  const currentStepDefaultValues = stepDefaultValues[currentStepIndex];

  function clearCurrentStep() {
    if (!currentStepFieldNames || !currentStepDefaultValues) return;

    reset(
      {
        ...getValues(),
        ...currentStepDefaultValues,
      },
      {
        keepErrors: false,
        keepDirty: false,
        keepTouched: false,
      },
    );

    clearErrors([...currentStepFieldNames]);
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button type="button" variant="outline" onClick={clearCurrentStep} disabled={isSubmitting}>
        <RotateCcw aria-hidden className="size-4" />
        Limpar etapa
      </Button>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={backStep}
          disabled={step === 1 || isSubmitting}
        >
          <ChevronLeft aria-hidden className="size-4" />
          Voltar
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {step !== lastStep ? (
            <>
              Continuar
              <ChevronRight aria-hidden className="size-4" />
            </>
          ) : (
            "Finalizar"
          )}
        </Button>
      </div>
    </div>
  );
}
