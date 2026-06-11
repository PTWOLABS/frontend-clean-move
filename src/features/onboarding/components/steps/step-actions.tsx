"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { FieldPath, useFormContext } from "react-hook-form";

import type { OnboardingFormValues } from "../../schemas/onboarding-schema";
import { useState } from "react";
import { AlertDialog } from "@/components/ui/alert-dialog/alert-dialog";

const companyStepFieldNames = [
  "cnpj",
  "legalName",
  "tradeName",
] as const satisfies readonly FieldPath<OnboardingFormValues>[];

const serviceStepFieldNames = [
  "serviceName",
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
  "startsAt",
  "endsAt",
] as const satisfies readonly FieldPath<OnboardingFormValues>[];

export type OnboardingStepId = "company" | "service" | "customerVehicle" | "appointment";

const stepFieldNames = {
  company: companyStepFieldNames,
  service: serviceStepFieldNames,
  customerVehicle: customerVehicleStepFieldNames,
  appointment: appointmentStepFieldNames,
} as const satisfies Record<OnboardingStepId, readonly FieldPath<OnboardingFormValues>[]>;

const companyStepDefaultValues = {
  cnpj: "",
  legalName: "",
  tradeName: "",
} satisfies Partial<OnboardingFormValues>;

const serviceStepDefaultValues = {
  serviceName: "",
  description: "",
  category: "",
  minDurationInMinutes: "",
  maxDurationInMinutes: "",
  price: "",
  isActive: true,
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
  startsAt: null,
  endsAt: null,
} satisfies Partial<OnboardingFormValues>;

const stepDefaultValues = {
  company: companyStepDefaultValues,
  service: serviceStepDefaultValues,
  customerVehicle: customerVehicleStepDefaultValues,
  appointment: appointmentStepDefaultValues,
} as const satisfies Record<OnboardingStepId, Partial<OnboardingFormValues>>;

type StepActionsProps = {
  step: number;
  lastStep: number;
  currentStepId: OnboardingStepId;
  backStep: () => void;
};

export function StepActions({ step, lastStep, currentStepId, backStep }: StepActionsProps) {
  const {
    getValues,
    reset,
    clearErrors,
    formState: { isSubmitting },
  } = useFormContext<OnboardingFormValues>();

  const [openConfirmClearStepDialog, setOpenConfirmClearStepDialog] = useState(false);

  const currentStepFieldNames = stepFieldNames[currentStepId];
  const currentStepDefaultValues = stepDefaultValues[currentStepId];

  function clearCurrentStep() {
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
    setOpenConfirmClearStepDialog(false);
  }

  function onClearCurrentStepClick() {
    const currentStepValues = currentStepFieldNames.map((value) => {
      return getValues(value);
    });

    let shouldClearCurrentStep = false;

    currentStepValues.forEach((value) => {
      if (String(value).trim().length >= 1) {
        shouldClearCurrentStep = true;
      }
    });

    if (shouldClearCurrentStep) {
      setOpenConfirmClearStepDialog(true);
    }
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={onClearCurrentStepClick}
        disabled={isSubmitting}
        className="text-destructive/90 hover:bg-destructive/10 hover:text-destructive border-destructive/20 hover:border-destructive/40"
      >
        <Trash2 aria-hidden className="size-4" />
        Descartar etapa
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
      <AlertDialog
        open={openConfirmClearStepDialog}
        onOpenChange={setOpenConfirmClearStepDialog}
        title="Descartar dados desta etapa?"
        descriptionContent={
          "Os campos preenchidos nesta etapa serão apagados. As outras etapas não serão alteradas."
        }
        actionMessage="Descartar"
        onConfirm={() => clearCurrentStep()}
        onCancel={() => setOpenConfirmClearStepDialog(false)}
      />
    </div>
  );
}
