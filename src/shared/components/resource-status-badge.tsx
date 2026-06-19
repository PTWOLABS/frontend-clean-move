import { Badge } from "@/components/ui/badge";
import { ResourceStatus } from "@/features/appointments/types/appointments-dto";
import { cn } from "../utils/cn";
import { HintTooltip, HintTooltipProvider } from "./hint-tooltip";

const resourceStatusBadgeMeta = {
  UPDATED: {
    label: "Atualizado",
    className: "border-transparent bg-warning-soft text-warning-soft-foreground",
    tooltipLabel:
      "Dados desse recurso mudaram após a criação do agendamento. O histórico original foi preservado; remova e selecione novamente para usar os dados atuais caso desejar.",
  },
  DELETED: {
    label: "Removido",
    className: "border-transparent bg-danger-soft text-danger-soft-foreground",
    tooltipLabel:
      "Esse recurso não está mais disponível para novas seleções. O histórico original foi preservado; remova e escolha outro recurso se precisar atualizar.",
  },
} satisfies Partial<
  Record<
    ResourceStatus,
    {
      label: string;
      className: string;
      tooltipLabel: string;
    }
  >
>;

export function ResourceStatusBadge({ status }: { status?: ResourceStatus }) {
  if (!status || status === "UNCHANGED") {
    return null;
  }

  const meta = resourceStatusBadgeMeta[status];

  if (!meta) {
    return null;
  }

  return (
    <HintTooltipProvider>
      <HintTooltip label={meta.tooltipLabel} className="max-w-100">
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
