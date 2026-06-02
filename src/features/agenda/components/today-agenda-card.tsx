import Link from "next/link";
import { CalendarDays, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";
import { Separator } from "@/components/ui/separator";

type TodayAgendaStatus = "in-progress" | "scheduled";

export type TodayAgendaItem = {
  id: string;
  time: string;
  customerName: string;
  vehicleName: string;
  vehiclePlate: string;
  serviceName: string;
  status: TodayAgendaStatus;
};

type TodayAgendaCardProps = {
  appointments: TodayAgendaItem[];
};

const statusMeta: Record<
  TodayAgendaStatus,
  {
    label: string;
    className: string;
  }
> = {
  "in-progress": {
    label: "Em andamento",
    className: "border-transparent bg-info-soft text-info-soft-foreground",
  },
  scheduled: {
    label: "Agendado",
    className: "border-transparent bg-warning-soft text-warning-soft-foreground",
  },
};

export function TodayAgendaCard({ appointments }: TodayAgendaCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-4 border-b border-border/70 px-4 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Clock3 className="size-4" aria-hidden />
            </span>
            Agenda de Hoje
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Serviços e horários previstos para a operação do dia.
          </p>
        </div>

        <Button asChild variant="outline" className="h-10 w-full shrink-0 sm:w-auto">
          <Link href="/appointments">
            <CalendarDays className="size-4" aria-hidden />
            Ver calendário
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {appointments.length ? (
          <ol className="divide-y divide-border/60">
            {appointments.map((appointment) => {
              const status = statusMeta[appointment.status];

              return (
                <li
                  key={appointment.id}
                  className="grid gap-3 px-4 py-4 transition-colors hover:bg-accent-soft/20 sm:grid-cols-[4.5rem_minmax(0,1fr)_minmax(9rem,auto)] sm:items-center sm:px-6"
                >
                  <div>
                  <time
                    dateTime={appointment.time}
                    className="text-sm font-semibold tabular-nums text-muted-foreground sm:text-base"
                  >
                    {appointment.time}
                  </time>
                  <Separator orientation="vertical"/>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-card-foreground">
                      {appointment.customerName}
                    </p>
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span className="min-w-0 truncate">{appointment.vehicleName}</span>
                      <Badge
                        variant="outline"
                        className="shrink-0 rounded-full border-border/70 bg-muted/45 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground"
                      >
                        {appointment.vehiclePlate}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <Badge
                      variant="outline"
                      className={cn("rounded-full px-2.5 py-1 text-[11px]", status.className)}
                    >
                      {status.label}
                    </Badge>
                    <p className="min-w-0 truncate text-sm font-medium text-card-foreground/85">
                      {appointment.serviceName}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
              <p className="font-medium text-card-foreground">Nenhum agendamento para hoje.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Os horários do dia aparecerão aqui quando houver agendamentos.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
