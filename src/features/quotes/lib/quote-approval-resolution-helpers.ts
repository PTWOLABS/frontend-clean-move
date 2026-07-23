import { CarFront, LucideIcon, UserRoundCheck, Wrench } from "lucide-react";
import {
  QuoteApprovalAnalysisDto,
  QuoteCustomerAnalysisDto,
  QuoteServiceAnalysisDto,
  QuoteVehicleAnalysisDto,
} from "../types/analyze-quote-approval";
import {
  formatQuoteApprovalAnalysisCount,
  formatQuoteApprovalAnalysisList,
} from "./quote-approval-analysis-feedback";
import {
  QUOTE_CUSTOMER_ANALYSIS_STATUS_LABELS,
  QUOTE_CUSTOMER_CONFLICT_LABELS,
  QUOTE_CUSTOMER_MATCHED_BY_LABELS,
  QUOTE_SERVICE_ANALYSIS_STATUS_LABELS,
  QUOTE_SERVICE_DIFFERENCE_LABELS,
  QUOTE_SERVICE_RESOLUTION_ACTION_LABELS,
  QUOTE_VEHICLE_ANALYSIS_STATUS_LABELS,
  QUOTE_VEHICLE_RESOLUTION_ACTION_LABELS,
} from "../constants/quote-approval-analysis-labels";

export type ResolutionCard = {
  id: string;
  area: string;
  title: string;
  description: string;
  actions: string[];
  icon: LucideIcon;
};

export const CUSTOMER_RESOLUTION_ACTION_LABELS = {
  LINK_EXISTING: "vincular cliente existente",
  CREATE_NEW: "criar novo cliente",
};

export function getCustomerActions(customer: QuoteCustomerAnalysisDto) {
  if (!customer.requiresResolution) return [];

  if (customer.status === "CREATE_REQUIRED") {
    return [CUSTOMER_RESOLUTION_ACTION_LABELS.CREATE_NEW];
  }

  return [
    CUSTOMER_RESOLUTION_ACTION_LABELS.LINK_EXISTING,
    CUSTOMER_RESOLUTION_ACTION_LABELS.CREATE_NEW,
  ];
}

export function getCustomerDescription(customer: QuoteCustomerAnalysisDto) {
  const candidatesCount = customer.candidates.length;
  const matchedBy = [
    ...new Set(
      customer.candidates.flatMap((candidate) =>
        candidate.matchedBy.map((matchedByItem) => QUOTE_CUSTOMER_MATCHED_BY_LABELS[matchedByItem]),
      ),
    ),
  ];
  const conflicts = [
    ...new Set(
      customer.candidates.flatMap((candidate) =>
        candidate.conflictingFields.map((field) => QUOTE_CUSTOMER_CONFLICT_LABELS[field]),
      ),
    ),
  ];
  const details = [
    candidatesCount > 0
      ? formatQuoteApprovalAnalysisCount(
          candidatesCount,
          "cliente candidato encontrado",
          "clientes candidatos encontrados",
        )
      : "",
    matchedBy.length > 0
      ? `Correspondências por ${formatQuoteApprovalAnalysisList(matchedBy)}.`
      : "",
    conflicts.length > 0
      ? `Campos conflitantes: ${formatQuoteApprovalAnalysisList(conflicts)}.`
      : "",
  ].filter(Boolean);

  return details.length > 0
    ? details.join(" ")
    : "Defina como o cliente do orçamento deve ser tratado na aprovação.";
}

export function getVehicleDescription(vehicle: QuoteVehicleAnalysisDto) {
  if (vehicle.candidateVehicleId) {
    return "Há um veículo candidato para associar ao agendamento.";
  }

  if (vehicle.candidateCustomerId) {
    return "O veículo encontrado está relacionado a outro cliente.";
  }

  return "Defina se o veículo deve ser criado, vinculado ou mantido apenas como dados do orçamento.";
}

function getServiceDescription(service: QuoteServiceAnalysisDto) {
  const details = [
    service.candidate ? `Candidato encontrado: ${service.candidate.name}.` : "",
    service.differences.length > 0
      ? `Diferenças: ${formatQuoteApprovalAnalysisList(
          service.differences.map((difference) => QUOTE_SERVICE_DIFFERENCE_LABELS[difference]),
        )}.`
      : "",
  ].filter(Boolean);

  return details.length > 0
    ? details.join(" ")
    : "Defina como este serviço deve ser tratado na aprovação.";
}

export function getResolutionCards(analysis: QuoteApprovalAnalysisDto): ResolutionCard[] {
  const cards: ResolutionCard[] = [];

  if (analysis.customer.requiresResolution) {
    cards.push({
      id: "customer",
      area: "Cliente",
      title: QUOTE_CUSTOMER_ANALYSIS_STATUS_LABELS[analysis.customer.status],
      description: getCustomerDescription(analysis.customer),
      actions: getCustomerActions(analysis.customer),
      icon: UserRoundCheck,
    });
  }

  if (analysis.vehicle.requiresResolution) {
    cards.push({
      id: "vehicle",
      area: "Veículo",
      title: QUOTE_VEHICLE_ANALYSIS_STATUS_LABELS[analysis.vehicle.status],
      description: getVehicleDescription(analysis.vehicle),
      actions: analysis.vehicle.allowedActions.map(
        (action) => QUOTE_VEHICLE_RESOLUTION_ACTION_LABELS[action],
      ),
      icon: CarFront,
    });
  }

  analysis.services
    .filter((service) => service.requiresResolution)
    .forEach((service) => {
      cards.push({
        id: `service-${service.quoteServiceId}`,
        area: "Serviço",
        title: `${QUOTE_SERVICE_ANALYSIS_STATUS_LABELS[service.status]}: ${service.snapshot.name}`,
        description: getServiceDescription(service),
        actions: service.allowedActions.map(
          (action) => QUOTE_SERVICE_RESOLUTION_ACTION_LABELS[action],
        ),
        icon: Wrench,
      });
    });

  return cards;
}
