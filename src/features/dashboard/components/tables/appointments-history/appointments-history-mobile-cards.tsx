"use client";

import {
  AppointmentMobileCardsSkeleton,
  AppointmentMobileCardsList as SharedAppointmentMobileCardsList,
} from "@/shared/components/appointments/appointment-mobile-cards";
import {
  findAppointmentByMobileCardItem,
  mapAppointmentPresentationItemToMobileCardItem,
  type AppointmentPresentationItem,
} from "@/shared/components/appointments/appointment-presenters";
import { cn } from "@/shared/utils/cn";

type AppointmentsHistoryMobileCardsProps = {
  appointments?: AppointmentPresentationItem[];
  isLoading?: boolean;
  message?: string;
  className?: string;
  onAppointmentClick?: (appointment: AppointmentPresentationItem) => void;
  onAppointmentServicesClick?: (appointment: AppointmentPresentationItem) => void;
};

function getShortDateLabel(dateLabel: string) {
  const [day, month, year] = dateLabel.split("/");

  if (!day || !month || !year) {
    return dateLabel;
  }

  return `${day}/${month}/${year.slice(-2)}`;
}

function AppointmentsHistoryMobileMessage({ message }: { message: string }) {
  return (
    <div className="px-3 pb-4 pt-1 min-[380px]:px-4">
      <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/45 px-4 text-center text-sm text-muted-foreground">
        {message}
      </div>
    </div>
  );
}

export function AppointmentsHistoryMobileCardsList({
  appointments,
  onAppointmentClick,
  onAppointmentServicesClick,
}: {
  appointments: AppointmentPresentationItem[];
  onAppointmentClick?: (appointment: AppointmentPresentationItem) => void;
  onAppointmentServicesClick?: (appointment: AppointmentPresentationItem) => void;
}) {
  return (
    <SharedAppointmentMobileCardsList
      appointments={appointments.map((appointment) =>
        mapAppointmentPresentationItemToMobileCardItem(appointment, {
          dateLabel: getShortDateLabel(
            appointment.startsAt.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
          ),
        }),
      )}
      onAppointmentClick={
        onAppointmentClick
          ? (mobileAppointment) => {
              const appointment = findAppointmentByMobileCardItem(appointments, mobileAppointment);

              if (appointment) {
                onAppointmentClick(appointment);
              }
            }
          : undefined
      }
      onAppointmentServicesClick={
        onAppointmentServicesClick
          ? (mobileAppointment) => {
              const appointment = findAppointmentByMobileCardItem(appointments, mobileAppointment);

              if (appointment) {
                onAppointmentServicesClick(appointment);
              }
            }
          : undefined
      }
    />
  );
}

export function AppointmentsHistoryMobileCards({
  appointments = [],
  isLoading = false,
  message,
  className,
  onAppointmentClick,
  onAppointmentServicesClick,
}: AppointmentsHistoryMobileCardsProps) {
  return (
    <div className={cn("md:hidden", className)}>
      {isLoading ? (
        <AppointmentMobileCardsSkeleton ariaLabel="Carregando histórico de agendamentos" />
      ) : null}
      {!isLoading && message ? <AppointmentsHistoryMobileMessage message={message} /> : null}
      {!isLoading && !message && !appointments.length ? (
        <AppointmentsHistoryMobileMessage message="Nenhum agendamento encontrado." />
      ) : null}
      {!isLoading && !message && appointments.length ? (
        <AppointmentsHistoryMobileCardsList
          appointments={appointments}
          onAppointmentClick={onAppointmentClick}
          onAppointmentServicesClick={onAppointmentServicesClick}
        />
      ) : null}
    </div>
  );
}
