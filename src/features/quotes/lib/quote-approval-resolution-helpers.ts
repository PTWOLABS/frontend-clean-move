import { CarFront, UserRoundCheck, Wrench, type LucideIcon } from "lucide-react";

import {
  QUOTE_CUSTOMER_ANALYSIS_STATUS_LABELS,
  QUOTE_CUSTOMER_DIVERGENT_FIELD_LABELS,
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

type ResolutionSelectionTarget = "customer" | "vehicle" | "service";

export type PendingResolutionSelection = {
  id: string;
  target: ResolutionSelectionTarget;
};

export type QuoteApprovalResolutionValues = Pick<
  ApproveQuoteBody,
  "customerResolution" | "vehicleResolution" | "serviceResolutions"
> & {
  pendingSelections?: PendingResolutionSelection[];
};

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
    }
  | {
      id: string;
      target: ResolutionSelectionTarget;
      requiresDetails: true;
    };

export type ResolutionActionOption = {
  id: string;
  label: string;
  selection: ResolutionSelection;
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

export const CUSTOMER_LINK_EXISTING_PENDING_SELECTION_ID = "customer-LINK_EXISTING";

export function createEmptyQuoteApprovalResolutionValues(): QuoteApprovalResolutionValues {
  return {
    pendingSelections: [],
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
        candidate.conflictingFields.map((field) => QUOTE_CUSTOMER_DIVERGENT_FIELD_LABELS[field]),
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
      ? `Dados divergentes encontrados: ${formatQuoteApprovalAnalysisList(conflicts)}.`
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
      id: CUSTOMER_LINK_EXISTING_PENDING_SELECTION_ID,
      label,
      selection: {
        id: CUSTOMER_LINK_EXISTING_PENDING_SELECTION_ID,
        target: "customer",
        requiresDetails: true,
      },
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
): ResolutionSelection {
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

  return {
    id: `vehicle-${action}`,
    target: "vehicle",
    requiresDetails: true,
  };
}

function getVehicleActionOptions(vehicle: QuoteVehicleAnalysisDto): ResolutionActionOption[] {
  return vehicle.allowedActions.map((action) => ({
    id: `vehicle-${action}`,
    label: QUOTE_VEHICLE_RESOLUTION_ACTION_LABELS[action],
    selection: getVehicleActionSelection(vehicle, action),
  }));
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
): ResolutionSelection {
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

  return {
    id: `service-${service.quoteServiceId}-${action}`,
    target: "service",
    requiresDetails: true,
  };
}

function getServiceActionOptions(service: QuoteServiceAnalysisDto): ResolutionActionOption[] {
  return service.allowedActions.map((action) => ({
    id: `service-${service.quoteServiceId}-${action}`,
    label: QUOTE_SERVICE_RESOLUTION_ACTION_LABELS[action],
    selection: getServiceActionSelection(service, action),
  }));
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
  if ("requiresDetails" in selection) {
    return applyPendingResolutionSelection(values, selection);
  }

  if (selection.target === "customer") {
    return {
      ...values,
      pendingSelections: removePendingSelections(values.pendingSelections, "customer"),
      customerResolution: selection.resolution,
    };
  }

  if (selection.target === "vehicle") {
    return {
      ...values,
      pendingSelections: removePendingSelections(values.pendingSelections, "vehicle"),
      vehicleResolution: selection.resolution,
    };
  }

  return {
    ...values,
    pendingSelections: removePendingSelections(values.pendingSelections, "service"),
    serviceResolutions: [
      ...(values.serviceResolutions ?? []).filter(
        (resolution) => resolution.quoteServiceId !== selection.resolution.quoteServiceId,
      ),
      selection.resolution,
    ],
  };
}

function applyPendingResolutionSelection(
  values: QuoteApprovalResolutionValues,
  selection: Extract<ResolutionSelection, { requiresDetails: true }>,
): QuoteApprovalResolutionValues {
  return {
    ...values,
    pendingSelections: [
      ...removePendingSelections(values.pendingSelections, selection.target),
      {
        id: selection.id,
        target: selection.target,
      },
    ],
    customerResolution: selection.target === "customer" ? undefined : values.customerResolution,
    vehicleResolution: selection.target === "vehicle" ? undefined : values.vehicleResolution,
    serviceResolutions: values.serviceResolutions ?? [],
  };
}

function removePendingSelections(
  pendingSelections: PendingResolutionSelection[] | undefined,
  target: ResolutionSelectionTarget,
) {
  return (pendingSelections ?? []).filter((selection) => selection.target !== target);
}

export function isQuoteApprovalResolutionSelected(
  values: QuoteApprovalResolutionValues,
  selection: ResolutionSelection,
) {
  if ("requiresDetails" in selection) {
    if (
      selection.id === CUSTOMER_LINK_EXISTING_PENDING_SELECTION_ID &&
      values.customerResolution?.action === "LINK_EXISTING"
    ) {
      return true;
    }

    return values.pendingSelections?.some(
      (pendingSelection) => pendingSelection.id === selection.id,
    );
  }

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

export function hasPendingQuoteApprovalResolutionDetails(values: QuoteApprovalResolutionValues) {
  return (values.pendingSelections?.length ?? 0) > 0;
}
