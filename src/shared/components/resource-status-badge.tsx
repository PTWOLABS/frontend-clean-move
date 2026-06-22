import { Badge } from "@/components/ui/badge";
import { ResourceStatus } from "@/features/appointments/types/appointments-dto";
import { cn } from "../utils/cn";
import { HintTooltip, HintTooltipProvider } from "./hint-tooltip";

const resourceStatusBadgeMeta = {
  UPDATED: {
    label: "Atualizado",
    className: "border-transparent bg-warning-soft text-warning-soft-foreground",
    getTooltipLabel: (resourceName: string, sourceName: string) =>
      `Este ${resourceName} mudou no ${sourceName} após a criação do agendamento. O histórico original foi preservado; remova e selecione novamente para usar as condições atuais, se desejar.`,
  },
  DELETED: {
    label: "Removido",
    className: "border-transparent bg-danger-soft text-danger-soft-foreground",
    getTooltipLabel: (resourceName: string, sourceName: string) =>
      `Este ${resourceName} não está mais disponível no ${sourceName}. O histórico original foi preservado; remova para escolher outro ${resourceName}, se precisar atualizar.`,
  },
} satisfies Partial<
  Record<
    ResourceStatus,
    {
      label: string;
      className: string;
      getTooltipLabel: (resourceName: string, sourceName: string) => string;
    }
  >
>;

type ResourceStatusBadgeProps = {
  status?: ResourceStatus;
  resourceName?: string;
  sourceName?: string;
};

export function ResourceStatusBadge({
  status,
  resourceName = "serviço",
  sourceName = "catálogo",
}: ResourceStatusBadgeProps) {
  if (!status || status === "UNCHANGED") {
    return null;
  }

  const meta = resourceStatusBadgeMeta[status];

  if (!meta) {
    return null;
  }

  return (
    <HintTooltipProvider>
      <HintTooltip label={meta.getTooltipLabel(resourceName, sourceName)} className="max-w-100">
        <Badge
          variant="outline"
          className={cn("w-fit rounded-full px-2 py-0.5 text-[11px]", meta.className)}
        >
          {meta.label}
        </Badge>
      </HintTooltip>
    </HintTooltipProvider>
  );
}
