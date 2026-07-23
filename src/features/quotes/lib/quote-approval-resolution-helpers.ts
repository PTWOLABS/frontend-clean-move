import { CarFront, UserRoundCheck, Wrench, type LucideIcon } from "lucide-react";

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
import type {
  QuoteApprovalAnalysisDto,
  QuoteCustomerAnalysisDto,
  QuoteServiceAnalysisDto,
  QuoteServiceResolutionAction,
  QuoteVehicleAnalysisDto,
  QuoteVehicleResolutionAction,
} from "../types/analyze-quote-approval";
import type {
  ApproveQuoteBody,
  ApproveQuoteCustomerResolution,
  ApproveQuoteServiceResolution,
  ApproveQuoteVehicleResolution,
} from "../types/quote-approval";
import {
  formatQuoteApprovalAnalysisCount,
  formatQuoteApprovalAnalysisList,
} from "./quote-approval-analysis-feedback";

export type QuoteApprovalResolutionValues = Pick<
  ApproveQuoteBody,
  "customerResolution" | "vehicleResolution" | "serviceResolutions"
>;

export type ResolutionSelection =
  | {
      target: "customer";
      resolution: ApproveQuoteCustomerResolution;
    }
  | {
      target: "vehicle";
      resolution: ApproveQuoteVehicleResolution;
    }
  | {
      target: "service";
      resolution: ApproveQuoteServiceResolution;
    };

export type ResolutionActionOption = {
  id: string;
  label: string;
  selection: ResolutionSelection | null;
  disabledReason?: string;
};

export type ResolutionCard = {
  id: string;
  area: string;
  title: string;
  description: string;
  actions: ResolutionActionOption[];
  icon: LucideIcon;
};

export const CUSTOMER_RESOLUTION_ACTION_LABELS = {
  LINK_EXISTING: "vincular cliente existente",
  CREATE_NEW: "criar novo cliente",
};

export function createEmptyQuoteApprovalResolutionValues(): QuoteApprovalResolutionValues {
  return {
    serviceResolutions: [],
  };
}

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

function getCustomerActionOptions(customer: QuoteCustomerAnalysisDto): ResolutionActionOption[] {
  return getCustomerActions(customer).map((label) => {
    if (label === CUSTOMER_RESOLUTION_ACTION_LABELS.CREATE_NEW) {
      return {
        id: "customer-CREATE_NEW",
        label,
        selection: {
          target: "customer",
          resolution: {
            action: "CREATE_NEW",
          },
        },
      };
    }

    if (customer.candidates.length === 1) {
      return {
        id: "customer-LINK_EXISTING",
        label,
        selection: {
          target: "customer",
          resolution: {
            action: "LINK_EXISTING",
            customerId: customer.candidates[0].customerId,
          },
        },
      };
    }

    return {
      id: "customer-LINK_EXISTING",
      label,
      selection: null,
      disabledReason: "Escolha do cliente candidato será adicionada no próximo passo.",
    };
  });
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

function getVehicleActionSelection(
  vehicle: QuoteVehicleAnalysisDto,
  action: QuoteVehicleResolutionAction,
): ResolutionSelection | null {
  if (action === "CREATE_FROM_SNAPSHOT" || action === "KEEP_SNAPSHOT_ONLY") {
    return {
      target: "vehicle",
      resolution: {
        action,
      },
    };
  }

  if (action === "LINK_EXISTING" && vehicle.candidateVehicleId) {
    return {
      target: "vehicle",
      resolution: {
        action,
        vehicleId: vehicle.candidateVehicleId,
      },
    };
  }

  return null;
}

function getVehicleActionOptions(vehicle: QuoteVehicleAnalysisDto): ResolutionActionOption[] {
  return vehicle.allowedActions.map((action) => {
    const selection = getVehicleActionSelection(vehicle, action);

    return {
      id: `vehicle-${action}`,
      label: QUOTE_VEHICLE_RESOLUTION_ACTION_LABELS[action],
      selection,
      disabledReason: selection ? undefined : "Esta resolução precisa de dados adicionais.",
    };
  });
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

function getServiceActionSelection(
  service: QuoteServiceAnalysisDto,
  action: QuoteServiceResolutionAction,
): ResolutionSelection | null {
  if (action === "KEEP_INACTIVE_LINK" || action === "RECREATE_FROM_SNAPSHOT") {
    return {
      target: "service",
      resolution: {
        quoteServiceId: service.quoteServiceId,
        action,
      },
    };
  }

  if (action === "ASSOCIATE_EXISTING" && service.candidateServiceId) {
    return {
      target: "service",
      resolution: {
        quoteServiceId: service.quoteServiceId,
        action,
        serviceId: service.candidateServiceId,
      },
    };
  }

  if (action === "RENAME_DETACHED" && service.snapshot.name) {
    return {
      target: "service",
      resolution: {
        quoteServiceId: service.quoteServiceId,
        action,
        serviceName: service.snapshot.name,
      },
    };
  }

  return null;
}

function getServiceActionOptions(service: QuoteServiceAnalysisDto): ResolutionActionOption[] {
  return service.allowedActions.map((action) => {
    const selection = getServiceActionSelection(service, action);

    return {
      id: `service-${service.quoteServiceId}-${action}`,
      label: QUOTE_SERVICE_RESOLUTION_ACTION_LABELS[action],
      selection,
      disabledReason: selection ? undefined : "Esta resolução precisa de dados adicionais.",
    };
  });
}

export function getResolutionCards(analysis: QuoteApprovalAnalysisDto): ResolutionCard[] {
  const cards: ResolutionCard[] = [];

  if (analysis.customer.requiresResolution) {
    cards.push({
      id: "customer",
      area: "Cliente",
      title: QUOTE_CUSTOMER_ANALYSIS_STATUS_LABELS[analysis.customer.status],
      description: getCustomerDescription(analysis.customer),
      actions: getCustomerActionOptions(analysis.customer),
      icon: UserRoundCheck,
    });
  }

  if (analysis.vehicle.requiresResolution) {
    cards.push({
      id: "vehicle",
      area: "Veículo",
      title: QUOTE_VEHICLE_ANALYSIS_STATUS_LABELS[analysis.vehicle.status],
      description: getVehicleDescription(analysis.vehicle),
      actions: getVehicleActionOptions(analysis.vehicle),
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
        actions: getServiceActionOptions(service),
        icon: Wrench,
      });
    });

  return cards;
}

export function applyQuoteApprovalResolutionSelection(
  values: QuoteApprovalResolutionValues,
  selection: ResolutionSelection,
): QuoteApprovalResolutionValues {
  if (selection.target === "customer") {
    return {
      ...values,
      customerResolution: selection.resolution,
    };
  }

  if (selection.target === "vehicle") {
    return {
      ...values,
      vehicleResolution: selection.resolution,
    };
  }

  return {
    ...values,
    serviceResolutions: [
      ...(values.serviceResolutions ?? []).filter(
        (resolution) => resolution.quoteServiceId !== selection.resolution.quoteServiceId,
      ),
      selection.resolution,
    ],
  };
}

export function isQuoteApprovalResolutionSelected(
  values: QuoteApprovalResolutionValues,
  selection: ResolutionSelection,
) {
  if (selection.target === "customer") {
    return values.customerResolution?.action === selection.resolution.action;
  }

  if (selection.target === "vehicle") {
    return values.vehicleResolution?.action === selection.resolution.action;
  }

  return values.serviceResolutions?.some(
    (resolution) =>
      resolution.quoteServiceId === selection.resolution.quoteServiceId &&
      resolution.action === selection.resolution.action,
  );
}
