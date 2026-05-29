import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useListCustomerOptionsMock = vi.hoisted(() => vi.fn());
const useListCustomerVehicleOptionsMock = vi.hoisted(() => vi.fn());
const useListServiceOptionsMock = vi.hoisted(() => vi.fn());
const useCreateAppointmentMock = vi.hoisted(() => vi.fn());
const useUpdateAppointmentMock = vi.hoisted(() => vi.fn());
const toastInfoMock = vi.hoisted(() => vi.fn());

vi.mock("../../hooks/queries/use-list-customer-options", () => ({
  useListCustomerOptions: useListCustomerOptionsMock,
}));

vi.mock("../../hooks/queries/use-list-customer-vehicle-options", () => ({
  useListCustomerVehicleOptions: useListCustomerVehicleOptionsMock,
}));

vi.mock("../../hooks/queries/use-list-service-options", () => ({
  useListServiceOptions: useListServiceOptionsMock,
}));

vi.mock("../../hooks/mutations/use-create-appointment-mutation", () => ({
  useCreateAppointment: useCreateAppointmentMock,
}));

vi.mock("../../hooks/mutations/use-update-appointment-mutation", () => ({
  useUpdateAppointment: useUpdateAppointmentMock,
}));

vi.mock("sonner", () => ({
  toast: {
    info: toastInfoMock,
  },
}));

vi.mock("@/components/ui/sheet", async () => {
  const React = await import("react");

  type SheetProps = {
    open?: boolean;
    children?: import("react").ReactNode;
  };
  type DivProps = import("react").ComponentPropsWithoutRef<"div"> & {
    side?: string;
  };

  const SheetContent = React.forwardRef<HTMLDivElement, DivProps>(({ side, ...props }, ref) => {
    void side;

    return <div ref={ref} {...props} />;
  });
  SheetContent.displayName = "SheetContent";

  return {
    Sheet: ({ open = true, children }: SheetProps) => (open ? <div>{children}</div> : null),
    SheetContent,
    SheetDescription: (props: DivProps) => <div {...props} />,
    SheetFooter: (props: DivProps) => <div {...props} />,
    SheetHeader: (props: DivProps) => <div {...props} />,
    SheetTitle: (props: DivProps) => <div {...props} />,
  };
});

vi.mock("@/components/ui/combobox/combobox", async () => {
  const React = await import("react");

  type ComboboxItemOption = {
    label: string;
    value: string;
    disabled?: boolean;
  };
  type ComboboxProps = Omit<
    import("react").ComponentPropsWithoutRef<"input">,
    "onChange" | "value"
  > & {
    items?: ComboboxItemOption[];
    value?: string;
    onDebouncedValueChange?: (value: string) => void;
    onSelectedItemChange?: (item: ComboboxItemOption | null) => void;
    onValueChange?: (value: string) => void;
    portalContainer?: unknown;
  };

  const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
    (
      {
        items,
        onDebouncedValueChange,
        onSelectedItemChange,
        onValueChange,
        portalContainer,
        value = "",
        ...props
      },
      ref,
    ) => {
      void items;
      void portalContainer;

      return (
        <input
          ref={ref}
          value={value}
          onChange={(event) => {
            const selectedItem =
              items?.find(
                (item) => item.label === event.target.value || item.value === event.target.value,
              ) ?? null;

            onValueChange?.(event.target.value);
            onDebouncedValueChange?.(event.target.value);
            onSelectedItemChange?.(selectedItem);
          }}
          {...props}
        />
      );
    },
  );
  Combobox.displayName = "Combobox";

  return { Combobox };
});

vi.mock("@/components/ui/multiple-selector", () => {
  type Option = {
    label: string;
    value: string;
  };

  type MultipleSelectorProps = {
    inputProps?: {
      id?: string;
      onBlur?: () => void;
      onValueChange?: (value: string) => void;
    };
    disabled?: boolean;
    onChange?: (options: Option[]) => void;
    options?: Option[];
    placeholder?: string;
    value?: Option[];
  };

  const MultipleSelector = ({
    disabled,
    inputProps,
    onChange,
    options = [],
    placeholder,
    value = [],
  }: MultipleSelectorProps) => (
    <select
      id={inputProps?.id}
      disabled={disabled}
      value={value[0]?.value ?? ""}
      onBlur={inputProps?.onBlur}
      onChange={(event) => {
        const selectedOption = options.find((option) => option.value === event.target.value);

        onChange?.(selectedOption ? [selectedOption] : []);
        inputProps?.onValueChange?.("");
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  return { default: MultipleSelector };
});

vi.mock("@/components/ui/calendar/date-picker-time", async () => {
  const React = await import("react");

  type DatePickerTimeProps = {
    value?: Date | string | number | null;
    invalid?: boolean;
    onBlur?: () => void;
    onChange?: (value: Date | null) => void;
    placeholder?: string;
    portalContainer?: unknown;
  };

  function normalizePickerValue(value: Date | string | number | null | undefined) {
    if (value === null || value === undefined || value === "") {
      return "empty";
    }

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? "invalid" : date.toISOString();
  }

  const DatePickerTime = React.forwardRef<HTMLDivElement, DatePickerTimeProps>(({ value }, ref) => (
    <div ref={ref} data-testid="date-picker-time">
      {normalizePickerValue(value)}
    </div>
  ));
  DatePickerTime.displayName = "DatePickerTime";

  return { DatePickerTime };
});

import { AppointmentFormSheet } from "./appointment-form-sheet";
import type { AppointmentCalendarEvent } from "../../types/appointment-calendar";

const appointmentToEdit: AppointmentCalendarEvent = {
  id: "appointment-1",
  title: "Lavagem completa",
  startsAt: new Date("2026-05-20T08:30:00.000Z"),
  end: new Date("2026-05-20T10:00:00.000Z"),
  extendedProps: {
    customerId: "customer-1",
    customer: "Cliente Teste",
    serviceIds: [{ value: "service-1", label: "Lavagem completa" }],
    service: "Lavagem completa",
    vehicleId: "vehicle-1",
    vehicle: "ABC-1234",
    endsAt: new Date("2026-05-20T10:00:00.000Z"),
    description: "Observação original",
    discountValue: "15,00",
    notes: "Observação original",
    tone: "info",
    status: "SCHEDULED",
  },
};

describe("AppointmentFormSheet", () => {
  beforeEach(() => {
    toastInfoMock.mockClear();
    useListCustomerOptionsMock.mockReturnValue({
      data: { customers: [] },
      isPending: false,
    });
    useListCustomerVehicleOptionsMock.mockReturnValue({
      data: { vehicles: [] },
      isPending: false,
    });
    useListServiceOptionsMock.mockReturnValue({
      data: { services: [] },
      isPending: false,
    });
    useCreateAppointmentMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    useUpdateAppointmentMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("keeps the provided default start date when the sheet opens", async () => {
    const defaultStartsAt = new Date("2026-05-20T08:30:00.000Z");

    render(<AppointmentFormSheet open onOpenChange={vi.fn()} defaultStartsAt={defaultStartsAt} />);

    await waitFor(() => {
      expect(screen.getAllByTestId("date-picker-time")[0]).toHaveTextContent(
        "2026-05-20T08:30:00.000Z",
      );
    });
    expect(screen.getAllByTestId("date-picker-time")[1]).toHaveTextContent("empty");
  });

  it("prefills fields when editing an existing appointment", async () => {
    render(<AppointmentFormSheet open onOpenChange={vi.fn()} appointment={appointmentToEdit} />);

    expect(screen.getByText("Editar agendamento")).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome do cliente/)).toHaveValue("Cliente Teste");
    expect(screen.getByLabelText(/Serviços/)).toHaveValue("service-1");
    expect(screen.getByLabelText(/Veículo/)).toHaveValue("ABC-1234");
    expect(screen.getAllByTestId("date-picker-time")[0]).toHaveTextContent(
      "2026-05-20T08:30:00.000Z",
    );
    expect(screen.getAllByTestId("date-picker-time")[1]).toHaveTextContent(
      "2026-05-20T10:00:00.000Z",
    );
    expect(screen.getByLabelText(/Descrição/)).toHaveValue("Observação original");
    expect(screen.getByLabelText(/Desconto/)).toHaveValue("15,00");
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeDisabled();
  });

  it("does not validate the vehicle field when the customer changes", async () => {
    const user = userEvent.setup();

    useListCustomerOptionsMock.mockReturnValue({
      data: { customers: [{ id: "customer-1", label: "Cliente Teste" }] },
      isPending: false,
    });

    render(
      <AppointmentFormSheet
        open
        onOpenChange={vi.fn()}
        defaultStartsAt={new Date("2026-05-20T08:30:00.000Z")}
      />,
    );

    await user.type(screen.getByLabelText(/Nome do cliente/), "Cliente Teste");

    await waitFor(() => {
      expect(screen.getByLabelText(/Veículo/)).toBeEnabled();
    });
    expect(screen.queryByText("Selecione um veículo.")).not.toBeInTheDocument();
  });

  it("blocks editing and communicates progress while creating the appointment", () => {
    useCreateAppointmentMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });

    render(
      <AppointmentFormSheet
        open
        onOpenChange={vi.fn()}
        defaultStartsAt={new Date("2026-05-20T08:30:00.000Z")}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Salvando agendamento...");
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();

    const submitButton = screen.getByRole("button", { name: "Salvando..." });

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText(/Nome do cliente/)).toBeDisabled();
    expect(screen.getByLabelText(/Serviços/)).toBeDisabled();
  });

  it("closes the sheet after the create request succeeds", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();
    const onOpenChange = vi.fn();

    useListCustomerOptionsMock.mockReturnValue({
      data: { customers: [{ id: "customer-1", label: "Cliente Teste" }] },
      isPending: false,
    });
    useListCustomerVehicleOptionsMock.mockReturnValue({
      data: { vehicles: [{ id: "vehicle-1", label: "ABC-1234" }] },
      isPending: false,
    });
    useListServiceOptionsMock.mockReturnValue({
      data: { services: [{ id: "service-1", label: "Lavagem completa" }] },
      isPending: false,
    });
    useCreateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(
      <AppointmentFormSheet
        open
        onOpenChange={onOpenChange}
        defaultStartsAt={new Date("2026-05-20T08:30:00.000Z")}
      />,
    );

    await user.type(screen.getByLabelText(/Nome do cliente/), "Cliente Teste");
    await user.selectOptions(screen.getByLabelText(/Serviços/), "service-1");

    const vehicleInput = screen.getByLabelText(/Veículo/);

    await waitFor(() => {
      expect(vehicleInput).toBeEnabled();
    });
    await user.type(vehicleInput, "ABC-1234");
    await user.click(screen.getByRole("button", { name: "Salvar agendamento" }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: "customer-1",
          serviceIds: ["service-1"],
          vehicleId: "vehicle-1",
        }),
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });

    const mutationOptions = mutate.mock.calls[0]?.[1] as { onSuccess?: () => void } | undefined;

    mutationOptions?.onSuccess?.();

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("sends only changed fields when editing an appointment", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();
    const onOpenChange = vi.fn();

    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(
      <AppointmentFormSheet open onOpenChange={onOpenChange} appointment={appointmentToEdit} />,
    );

    const descriptionInput = screen.getByLabelText(/Descrição/);

    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Nova observação");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          appointmentId: "appointment-1",
          body: {
            description: "Nova observação",
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });

    const mutationOptions = mutate.mock.calls[0]?.[1] as { onSuccess?: () => void } | undefined;

    mutationOptions?.onSuccess?.();

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
