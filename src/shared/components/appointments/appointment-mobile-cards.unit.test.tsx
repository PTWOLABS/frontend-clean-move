import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  AppointmentMobileCardsList,
  type AppointmentMobileCardItem,
} from "./appointment-mobile-cards";

const appointment: AppointmentMobileCardItem = {
  id: "appointment-1",
  dateLabel: "19/06/26",
  timeLabel: "09:00",
  customerName: "Cliente com nome longo",
  vehicleLabel: "Toyota Corolla XEI com descricao longa",
  vehiclePlate: "ABC-1234",
  serviceName: "Lavagem completa detalhada",
  amountLabel: "R$ 120,00",
  status: "SCHEDULED",
};

describe("AppointmentMobileCardsList", () => {
  it("shows text tooltips and keeps tooltip targets opening appointment details", async () => {
    const user = userEvent.setup();
    const onAppointmentClick = vi.fn();

    render(
      <AppointmentMobileCardsList
        appointments={[appointment]}
        onAppointmentClick={onAppointmentClick}
      />,
    );

    const customerName = screen.getByText(appointment.customerName);

    await user.hover(customerName);

    const tooltip = await screen.findByRole("tooltip");

    expect(within(tooltip).getByText(appointment.customerName)).toBeInTheDocument();

    await user.click(customerName);

    expect(onAppointmentClick).toHaveBeenCalledWith(appointment);
  });
});
