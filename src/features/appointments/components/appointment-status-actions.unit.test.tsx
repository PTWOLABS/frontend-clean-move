import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppointmentStatusActions } from "./appointment-status-actions";

describe("AppointmentStatusActions", () => {
  it("shows edit action inside the actions menu when provided", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onStatusChange = vi.fn();

    render(
      <AppointmentStatusActions
        appointmentId="appointment-1"
        currentStatus="SCHEDULED"
        isUpdating={false}
        onEdit={onEdit}
        onStatusChange={onStatusChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /ações do agendamento/i }));
    await user.click(screen.getByRole("menuitem", { name: /editar agendamento/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onStatusChange).not.toHaveBeenCalled();
  });

  it("calls onStatusChange for direct status changes", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <AppointmentStatusActions
        appointmentId="appointment-1"
        currentStatus="SCHEDULED"
        isUpdating={false}
        onStatusChange={onStatusChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /alterar status do agendamento/i }));
    await user.click(screen.getByRole("menuitem", { name: /marcar como concluído/i }));

    expect(onStatusChange).toHaveBeenCalledWith("appointment-1", "DONE");
  });

  it("prevents dropdown mouse down from closing parent calendar popovers before selecting an action", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const documentMouseDown = vi.fn();

    document.addEventListener("mousedown", documentMouseDown);

    try {
      render(
        <AppointmentStatusActions
          appointmentId="appointment-1"
          currentStatus="SCHEDULED"
          isUpdating={false}
          onStatusChange={onStatusChange}
        />,
      );

      await user.click(screen.getByRole("button", { name: /alterar status do agendamento/i }));
      documentMouseDown.mockClear();

      await user.click(screen.getByRole("menuitem", { name: /marcar como concluído/i }));

      expect(documentMouseDown).not.toHaveBeenCalled();
      expect(onStatusChange).toHaveBeenCalledWith("appointment-1", "DONE");
    } finally {
      document.removeEventListener("mousedown", documentMouseDown);
    }
  });

  it("asks for confirmation before cancelling an appointment", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <AppointmentStatusActions
        appointmentId="appointment-1"
        currentStatus="SCHEDULED"
        isUpdating={false}
        onStatusChange={onStatusChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /alterar status do agendamento/i }));
    await user.click(screen.getByRole("menuitem", { name: /cancelar agendamento/i }));

    expect(screen.getByRole("alertdialog", { name: /cancelar agendamento/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^cancelar agendamento$/i }));

    expect(onStatusChange).toHaveBeenCalledWith("appointment-1", "CANCELLED");
  });
});
