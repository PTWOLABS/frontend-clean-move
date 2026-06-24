import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppointmentStatusActions } from "./appointment-status-actions";

const deleteAppointmentMutationMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}));

vi.mock("../hooks/mutations/use-delete-appointment-mutation", () => ({
  useDeleteAppointment: () => deleteAppointmentMutationMock,
}));

describe("AppointmentStatusActions", () => {
  beforeEach(() => {
    deleteAppointmentMutationMock.mutate.mockClear();
    deleteAppointmentMutationMock.isPending = false;
  });

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

  it("closes only the dropdown when clicking outside the actions menu", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const documentPointerDown = vi.fn();
    const documentMouseDown = vi.fn();
    const documentClick = vi.fn();

    document.addEventListener("pointerdown", documentPointerDown);
    document.addEventListener("mousedown", documentMouseDown);
    document.addEventListener("click", documentClick);

    try {
      render(
        <div>
          <AppointmentStatusActions
            appointmentId="appointment-1"
            currentStatus="SCHEDULED"
            isUpdating={false}
            onStatusChange={onStatusChange}
          />
          <button type="button">Área fora do menu</button>
        </div>,
      );

      await user.click(screen.getByRole("button", { name: /alterar status do agendamento/i }));

      expect(screen.getByRole("menuitem", { name: /marcar como concluído/i })).toBeInTheDocument();

      documentPointerDown.mockClear();
      documentMouseDown.mockClear();
      documentClick.mockClear();

      const outsideButton = screen.getByText("Área fora do menu");

      fireEvent.pointerDown(outsideButton);
      fireEvent.mouseDown(outsideButton);
      fireEvent.click(outsideButton);

      expect(documentPointerDown).not.toHaveBeenCalled();
      expect(documentMouseDown).not.toHaveBeenCalled();
      expect(documentClick).not.toHaveBeenCalled();
      expect(
        screen.queryByRole("menuitem", { name: /marcar como concluído/i }),
      ).not.toBeInTheDocument();
      expect(onStatusChange).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener("pointerdown", documentPointerDown);
      document.removeEventListener("mousedown", documentMouseDown);
      document.removeEventListener("click", documentClick);
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

    const dialog = screen.getByRole("alertdialog", { name: /cancelar agendamento/i });

    expect(dialog).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: /^cancelar agendamento$/i }));

    expect(onStatusChange).toHaveBeenCalledWith("appointment-1", "CANCELLED");
  });

  it("asks for confirmation before deleting an appointment", async () => {
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
    await user.click(screen.getByRole("menuitem", { name: /excluir agendamento/i }));

    const dialog = screen.getByRole("alertdialog", { name: /excluir agendamento/i });

    expect(dialog).toBeInTheDocument();
    expect(deleteAppointmentMutationMock.mutate).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: /^excluir agendamento$/i }));

    expect(deleteAppointmentMutationMock.mutate).toHaveBeenCalledWith(
      "appointment-1",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(onStatusChange).not.toHaveBeenCalled();
  });

  it("does not show delete action for completed appointments", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <AppointmentStatusActions
        appointmentId="appointment-1"
        currentStatus="DONE"
        isUpdating={false}
        onStatusChange={onStatusChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /alterar status do agendamento/i }));

    expect(
      screen.queryByRole("menuitem", { name: /excluir agendamento/i }),
    ).not.toBeInTheDocument();
  });
});
