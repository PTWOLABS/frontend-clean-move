import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { AppointmentCalendarEvent } from "../../types/appointment-calendar";
import { CalendarListView } from "./calendar-list-view";

const multiDayAppointmentEvent: AppointmentCalendarEvent = {
  id: "appointment-1",
  title: "Consultoria de Detailing",
  startsAt: new Date(2026, 7, 1, 0),
  end: new Date(2026, 7, 29, 0),
  extendedProps: {
    customerId: "customer-1",
    customer: "Ana Martins",
    serviceIds: [{ value: "service-1", label: "Consultoria de Detailing" }],
    service: "Consultoria de Detailing",
    vehicleId: "vehicle-1",
    vehicle: {
      plate: "ABC-1234",
      brand: "Toyota",
      model: "Corolla",
      displayName: "Toyota Corolla",
    },
    endsAt: new Date(2026, 7, 29, 0),
    description: "",
    discountValue: "",
    notes: "Sem observacoes operacionais.",
    tone: "info",
    status: "SCHEDULED",
  },
};

describe("CalendarListView", () => {
  it("renders multi-day appointments on every covered day in the selected week", async () => {
    const user = userEvent.setup();
    const onSelectEvent = vi.fn();

    render(
      <CalendarListView
        events={[multiDayAppointmentEvent]}
        selectedDate={new Date(2026, 7, 18, 12)}
        selectedEventId={null}
        isLoading={false}
        onSelectEvent={onSelectEvent}
      />,
    );

    expect(screen.getByText("16 de agosto de 2026")).toBeInTheDocument();
    expect(screen.getByText("22 de agosto de 2026")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /consultoria de detailing/i })).toHaveLength(7);

    await user.click(screen.getAllByRole("button", { name: /consultoria de detailing/i })[3]!);

    expect(onSelectEvent).toHaveBeenCalledWith(multiDayAppointmentEvent);
  });
});
