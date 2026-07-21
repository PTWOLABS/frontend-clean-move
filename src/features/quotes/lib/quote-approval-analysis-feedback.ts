import { CarFront, ClipboardCheck, UserRoundCheck, Wrench } from "lucide-react";

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
  QuoteCustomerAnalysisStatus,
  QuoteVehicleAnalysisStatus,
} from "../types/analyze-quote-approval";
import type {
  QuoteApprovalAnalysisIssue,
  QuoteApprovalVerificationOutcome,
  QuoteApprovalVerificationStep,
} from "../types/quote-approval-analysis-feedback";

export function formatQuoteApprovalAnalysisList(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} e ${items[1]}`;

  return `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`;
}

export function formatQuoteApprovalAnalysisCount(count: number, singular: string, plural: string) {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

export function getQuoteApprovalVerificationOutcome(
  isAnalyzing: boolean,
  analysis?: QuoteApprovalAnalysisDto | null,
): QuoteApprovalVerificationOutcome {
  if (isAnalyzing || !analysis) return "checking";
  return analysis.status === "READY" ? "ready" : "requires-resolution";
}

export function getQuoteApprovalVerificationSteps(
  analysis: QuoteApprovalAnalysisDto | null | undefined,
  isAnalyzing: boolean,
): QuoteApprovalVerificationStep[] {
  if (isAnalyzing || !analysis) {
    return [
      {
        label: "Analisando cliente",
        description: "Conferindo vínculos e possíveis correspondências.",
        icon: UserRoundCheck,
        status: "running",
      },
      {
        label: "Analisando veículo",
        description: "Verificando vínculo, proprietário e dados do orçamento.",
        icon: CarFront,
        status: "pending",
      },
      {
        label: "Analisando serviços",
        description: "Comparando serviços vinculados e dados registrados.",
        icon: Wrench,
        status: "pending",
      },
      {
        label: "Resultado da análise",
        description: "Preparando o próximo passo da aprovação.",
        icon: ClipboardCheck,
        status: "pending",
      },
    ];
  }

  const servicesRequireResolution = analysis.services.some((service) => service.requiresResolution);
  const requiresResolution = analysis.status === "REQUIRES_RESOLUTION";

  return [
    {
      label: "Cliente analisado",
      description: QUOTE_CUSTOMER_ANALYSIS_STATUS_LABELS[analysis.customer.status],
      icon: UserRoundCheck,
      status: analysis.customer.requiresResolution ? "attention" : "complete",
    },
    {
      label: "Veículo analisado",
      description: QUOTE_VEHICLE_ANALYSIS_STATUS_LABELS[analysis.vehicle.status],
      icon: CarFront,
      status: analysis.vehicle.requiresResolution ? "attention" : "complete",
    },
    {
      label: "Serviços analisados",
      description: servicesRequireResolution
        ? "Um ou mais serviços precisam de resolução."
        : "Serviços prontos para aprovação.",
      icon: Wrench,
      status: servicesRequireResolution ? "attention" : "complete",
    },
    {
      label: "Resultado da análise",
      description: requiresResolution
        ? "Resolva as pendências antes de aprovar."
        : "Nenhuma pendência bloqueia a aprovação.",
      icon: ClipboardCheck,
      status: requiresResolution ? "attention" : "complete",
    },
  ];
}

function getCustomerIssue(analysis: QuoteApprovalAnalysisDto): QuoteApprovalAnalysisIssue | null {
  if (!analysis.customer.requiresResolution) return null;

  const candidatesCount = analysis.customer.candidates.length;
  const matchedBy = [
    ...new Set(
      analysis.customer.candidates.flatMap((candidate) =>
        candidate.matchedBy.map((matchedByItem) => QUOTE_CUSTOMER_MATCHED_BY_LABELS[matchedByItem]),
      ),
    ),
  ];
  const conflicts = [
    ...new Set(
      analysis.customer.candidates.flatMap((candidate) =>
        candidate.conflictingFields.map((field) => QUOTE_CUSTOMER_CONFLICT_LABELS[field]),
      ),
    ),
  ];

  const descriptionByStatus: Record<QuoteCustomerAnalysisStatus, string> = {
    RESOLVED: "O cliente foi resolvido, mas a análise ainda marcou essa etapa como pendente.",
    AUTO_LINK: "Revise a vinculação automática sugerida para o cliente antes de continuar.",
    CANDIDATES_FOUND: [
      `Encontramos ${formatQuoteApprovalAnalysisCount(
        candidatesCount,
        "possível cliente",
        "possíveis clientes",
      )}.`,
      matchedBy.length > 0
        ? `Correspondências por ${formatQuoteApprovalAnalysisList(matchedBy)}.`
        : "",
      conflicts.length > 0
        ? `Campos conflitantes: ${formatQuoteApprovalAnalysisList(conflicts)}.`
        : "",
    ]
      .filter(Boolean)
      .join(" "),
    CREATE_REQUIRED:
      "Nenhum cliente ativo corresponde aos dados do orçamento. Cadastre ou vincule um cliente antes de aprovar.",
    LINKED_RESOURCE_DELETED:
      "O cliente vinculado ao orçamento não está mais disponível. Escolha um cliente válido antes de aprovar.",
  };

  return {
    id: "customer",
    area: "Cliente",
    title: QUOTE_CUSTOMER_ANALYSIS_STATUS_LABELS[analysis.customer.status],
    description: descriptionByStatus[analysis.customer.status],
  };
}

function getVehicleIssue(analysis: QuoteApprovalAnalysisDto): QuoteApprovalAnalysisIssue | null {
  if (!analysis.vehicle.requiresResolution) return null;

  const actions = analysis.vehicle.allowedActions.map(
    (action) => QUOTE_VEHICLE_RESOLUTION_ACTION_LABELS[action],
  );
  const actionText =
    actions.length > 0
      ? `Ações disponíveis: ${formatQuoteApprovalAnalysisList(actions)}.`
      : "Escolha uma resolução para o veículo antes de continuar.";

  const descriptionByStatus: Record<QuoteVehicleAnalysisStatus, string> = {
    NONE: "O orçamento não possui veículo associado.",
    RESOLVED: "O veículo foi resolvido, mas a análise ainda marcou essa etapa como pendente.",
    CANDIDATE_FOUND: `Encontramos um veículo candidato para os dados do orçamento. ${actionText}`,
    SNAPSHOT_ONLY: `O orçamento possui apenas dados avulsos do veículo. ${actionText}`,
    OWNERSHIP_CONFLICT: `O veículo encontrado está vinculado a outro cliente. ${actionText}`,
    LINKED_RESOURCE_DELETED: `O veículo vinculado não está mais disponível. ${actionText}`,
  };

  return {
    id: "vehicle",
    area: "Veículo",
    title: QUOTE_VEHICLE_ANALYSIS_STATUS_LABELS[analysis.vehicle.status],
    description: descriptionByStatus[analysis.vehicle.status],
  };
}

function getServiceIssues(analysis: QuoteApprovalAnalysisDto): QuoteApprovalAnalysisIssue[] {
  return analysis.services
    .filter((service) => service.requiresResolution)
    .map((service) => {
      const differences = service.differences.map(
        (difference) => QUOTE_SERVICE_DIFFERENCE_LABELS[difference],
      );
      const actions = service.allowedActions.map(
        (action) => QUOTE_SERVICE_RESOLUTION_ACTION_LABELS[action],
      );
      const details = [
        service.candidate ? `Candidato encontrado: ${service.candidate.name}.` : "",
        differences.length > 0
          ? `Diferenças: ${formatQuoteApprovalAnalysisList(differences)}.`
          : "",
        actions.length > 0
          ? `Ações disponíveis: ${formatQuoteApprovalAnalysisList(actions)}.`
          : "Escolha uma resolução para este serviço antes de continuar.",
      ]
        .filter(Boolean)
        .join(" ");

      return {
        id: `service-${service.quoteServiceId}`,
        area: "Serviço",
        title: `${QUOTE_SERVICE_ANALYSIS_STATUS_LABELS[service.status]}: ${service.snapshot.name}`,
        description: details,
      };
    });
}

export function getQuoteApprovalAnalysisIssues(
  analysis?: QuoteApprovalAnalysisDto | null,
): QuoteApprovalAnalysisIssue[] {
  if (!analysis) return [];

  return [
    getCustomerIssue(analysis),
    getVehicleIssue(analysis),
    ...getServiceIssues(analysis),
  ].filter((issue): issue is QuoteApprovalAnalysisIssue => Boolean(issue));
}
