"use client";

import { useMemo } from "react";
import { BadgeDollarSign, CarFront, IdCard, Phone, UserRound, Wrench } from "lucide-react";

import { formatBrlFromCents } from "@/shared/money/format-brl-money";
import type { WizardSummaryItem } from "@/shared/components/wizard-summary-list";

import type { CreateQuoteFormInput } from "../types/create-quote";

export function useQuoteSummaryItems(
  stepOne: CreateQuoteFormInput["stepOne"] | undefined,
  stepTwo: CreateQuoteFormInput["stepTwo"] | undefined,
) {
  return useMemo<WizardSummaryItem[]>(() => {
    const customerName = asDisplayText(stepOne?.customer.name);
    const phone = asDisplayText(stepOne?.customer.phone);
    const email = asDisplayText(stepOne?.customer.email);
    const document = asDisplayText(stepOne?.customer.cpfCnpj);
    const selectedVehicleLabel = asDisplayText(stepOne?.vehicleLabel);
    const plate = asDisplayText(stepOne?.vehicle.plate).toLocaleUpperCase("pt-BR");
    const vehicleName =
      selectedVehicleLabel ||
      getVehicleDisplayLabel({
        brand: stepOne?.vehicle.brand,
        model: stepOne?.vehicle.model,
        plate,
      });
    const contactLabel = phone || email || "Contato não informado";
    const services = stepTwo?.services ?? [];
    const servicesCount = services.length;
    const servicesTotal = services.reduce((total, service) => {
      if (service.isCourtesy) return total;
      const priceInCents =
        typeof service.priceInCents === "number" && Number.isFinite(service.priceInCents)
          ? service.priceInCents
          : 0;

      return total + priceInCents;
    }, 0);

    return [
      {
        label: "Cliente",
        value: customerName || "Cliente não informado",
        completed: Boolean(customerName),
        icon: UserRound,
      },
      {
        label: "Contato",
        value: contactLabel,
        completed: Boolean(phone || email),
        icon: Phone,
      },
      {
        label: "Documento",
        value: document || "não informado",
        completed: Boolean(document),
        icon: IdCard,
      },
      {
        label: "Veículo",
        value: vehicleName,
        completed: vehicleName !== "Veículo não informado",
        icon: CarFront,
      },
      {
        label: "Serviços",
        value:
          servicesCount > 0
            ? `${servicesCount} ${servicesCount === 1 ? "serviço" : "serviços"}`
            : "Nenhum serviço",
        completed: servicesCount > 0,
        icon: Wrench,
      },
      {
        label: "Total",
        value: formatBrlFromCents(servicesTotal),
        completed: servicesCount > 0,
        icon: BadgeDollarSign,
      },
    ];
  }, [stepOne, stepTwo]);
}

function asDisplayText(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function getVehicleDisplayLabel({
  brand,
  model,
  plate,
}: {
  brand?: unknown;
  model?: unknown;
  plate?: unknown;
}) {
  const vehicleName = [asDisplayText(brand), asDisplayText(model)].filter(Boolean).join(" ");
  const vehiclePlate = asDisplayText(plate);

  if (vehicleName) return vehicleName;
  if (vehiclePlate) return vehiclePlate;

  return "Veículo não informado";
}
