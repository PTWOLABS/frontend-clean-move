import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/test-utils";

import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import { AppointmentsDayAgendaCard } from "./appointments-day-agenda-card";

const appointmentEvent: AppointmentCalendarEvent = {
  id: "appointment-1",
  title: "Lavagem tecnica +1",
  startsAt: new Date("2026-05-20T09:00:00.000Z"),
  end: new Date("2026-05-20T10:15:00.000Z"),
  extendedProps: {
    customerId: "customer-1",
    customer: "Ana Martins",
    serviceIds: [{ value: "service-1", label: "Lavagem tecnica" }],
    service: "Lavagem tecnica, Higienizacao",
    vehicleId: "vehicle-1",
    vehicle: {
      plate: "",
      brand: "",
      model: "",
      displayName: "Veículo não informado",
    },
    endsAt: new Date("2026-05-20T10:15:00.000Z"),
    description: "",
    discountValue: "",
    notes: "Sem observações operacionais.",
    tone: "info",
    status: "SCHEDULED",
  },
};

describe("AppointmentsDayAgendaCard", () => {
  it("renders a loading state", () => {
    renderWithProviders(
      <AppointmentsDayAgendaCard
        selectedDate={new Date("2026-05-20T12:00:00.000Z")}
        selectedEventId={null}
        events={[]}
        isLoading
        isRefreshing={false}
        isError={false}
        updatingStatusAppointmentId={null}
        onRetry={vi.fn()}
        onEditEvent={vi.fn()}
        onSelectEvent={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("status", { name: /carregando agenda do dia/i })).toBeInTheDocument();
    expect(screen.queryByText("Nenhum agendamento neste dia.")).not.toBeInTheDocument();
  });

  it("calls onSelectEvent when the user clicks an agenda item", async () => {
    const user = userEvent.setup();
    const onSelectEvent = vi.fn();

    renderWithProviders(
      <AppointmentsDayAgendaCard
        selectedDate={new Date("2026-05-20T12:00:00.000Z")}
        selectedEventId={null}
        events={[appointmentEvent]}
        isLoading={false}
        isRefreshing={false}
        isError={false}
        updatingStatusAppointmentId={null}
        onRetry={vi.fn()}
        onEditEvent={vi.fn()}
        onSelectEvent={onSelectEvent}
        onStatusChange={vi.fn()}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: /lavagem tecnica/i })[0]!);

    expect(onSelectEvent).toHaveBeenCalledWith(appointmentEvent);
  });

  it("renders multi-day appointments that cover the selected day", () => {
    const multiDayAppointmentEvent: AppointmentCalendarEvent = {
      ...appointmentEvent,
      startsAt: new Date("2026-05-01T00:00:00.000Z"),
      end: new Date("2026-05-29T00:00:00.000Z"),
      extendedProps: {
        ...appointmentEvent.extendedProps,
        endsAt: new Date("2026-05-29T00:00:00.000Z"),
      },
    };

    renderWithProviders(
      <AppointmentsDayAgendaCard
        selectedDate={new Date("2026-05-18T12:00:00.000Z")}
        selectedEventId={null}
        events={[multiDayAppointmentEvent]}
        isLoading={false}
        isRefreshing={false}
        isError={false}
        updatingStatusAppointmentId={null}
        onRetry={vi.fn()}
        onEditEvent={vi.fn()}
        onSelectEvent={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /lavagem tecnica/i })).toBeInTheDocument();
  });

  it("renders the agenda loading state while refreshing", () => {
    renderWithProviders(
      <AppointmentsDayAgendaCard
        selectedDate={new Date("2026-05-20T12:00:00.000Z")}
        selectedEventId={null}
        events={[appointmentEvent]}
        isLoading={false}
        isRefreshing
        isError={false}
        updatingStatusAppointmentId={null}
        onRetry={vi.fn()}
        onEditEvent={vi.fn()}
        onSelectEvent={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("status", { name: /carregando agenda do dia/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /lavagem tecnica/i })).not.toBeInTheDocument();
  });
});
