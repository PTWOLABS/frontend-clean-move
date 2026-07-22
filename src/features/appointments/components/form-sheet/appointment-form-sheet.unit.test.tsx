import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    portalContainer?: unknown;
    placeholder?: string;
    value?: Option[];
  };

  const MultipleSelector = ({
    disabled,
    inputProps,
    onChange,
    options = [],
    portalContainer,
    placeholder,
    value = [],
  }: MultipleSelectorProps) => {
    void portalContainer;

    return (
      <>
        <input
          aria-label="Options search"
          disabled={disabled}
          onChange={(event) => inputProps?.onValueChange?.(event.target.value)}
        />
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
      </>
    );
  };

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
    services: [
      {
        serviceId: "service-1",
        label: "Lavagem completa",
        priceInCents: 9000,
        currentResourceStatus: "UNCHANGED",
      },
    ],
    service: "Lavagem completa",
    vehicleId: "vehicle-1",
    vehicle: {
      plate: "ABC-1234",
      brand: "",
      model: "",
      displayName: "ABC-1234",
    },
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
      items: [],
      totalItems: 0,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useListCustomerVehicleOptionsMock.mockReturnValue({
      items: [],
      totalItems: 0,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useListServiceOptionsMock.mockReturnValue({
      items: [],
      totalItems: 0,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
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

  it("shows badges only for services changed after the snapshot", () => {
    render(
      <AppointmentFormSheet
        open
        onOpenChange={vi.fn()}
        appointment={{
          ...appointmentToEdit,
          extendedProps: {
            ...appointmentToEdit.extendedProps,
            customerResourceStatus: "UPDATED",
            vehicle: {
              ...appointmentToEdit.extendedProps.vehicle,
              currentResourceStatus: "UPDATED",
            },
            services: [
              {
                serviceId: "service-1",
                label: "Lavagem completa",
                priceInCents: 9000,
                currentResourceStatus: "UPDATED",
              },
            ],
          },
        }}
      />,
    );

    expect(screen.getByText("Atualizado")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remover cliente/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remover veículo/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Removido")).not.toBeInTheDocument();
  });

  it("locks a deleted customer until it is removed from the appointment edit", async () => {
    const user = userEvent.setup();

    render(
      <AppointmentFormSheet
        open
        onOpenChange={vi.fn()}
        appointment={{
          ...appointmentToEdit,
          extendedProps: {
            ...appointmentToEdit.extendedProps,
            customerResourceStatus: "DELETED",
          },
        }}
      />,
    );

    const customerInput = screen.getByLabelText(/Nome do cliente/);
    const vehicleInput = screen.getByLabelText(/Veículo/);

    expect(customerInput).toBeDisabled();
    expect(vehicleInput).toBeDisabled();
    expect(screen.getByText("Removido")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Remover cliente Cliente Teste/ }));

    expect(screen.getByText("Remover cliente deste agendamento?")).toBeInTheDocument();
    expect(
      screen.getByText(/O veículo também será removido porque depende do cliente selecionado./),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remover cliente" }));

    await waitFor(() => {
      expect(customerInput).toBeEnabled();
    });
    expect(customerInput).toHaveValue("");
    expect(vehicleInput).toHaveValue("");
    expect(vehicleInput).toBeDisabled();
  });

  it("does not keep a removed deleted customer selectable from the snapshot", async () => {
    const user = userEvent.setup();

    useListCustomerOptionsMock.mockReturnValue({
      items: [],
      totalItems: 0,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });

    render(
      <AppointmentFormSheet
        open
        onOpenChange={vi.fn()}
        appointment={{
          ...appointmentToEdit,
          extendedProps: {
            ...appointmentToEdit.extendedProps,
            customerResourceStatus: "DELETED",
          },
        }}
      />,
    );

    const customerInput = screen.getByLabelText(/Nome do cliente/);

    await user.click(screen.getByRole("button", { name: /Remover cliente Cliente Teste/ }));
    await user.click(screen.getByRole("button", { name: "Remover cliente" }));

    await waitFor(() => {
      expect(customerInput).toBeEnabled();
    });

    await user.type(customerInput, "Cliente Teste");

    expect(screen.queryByText("Removido")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Salvar altera/ }));

    expect(await screen.findByText(/Selecione um cliente./)).toBeInTheDocument();
  });

  it("locks a deleted vehicle until it is removed and replaced", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useListCustomerVehicleOptionsMock.mockReturnValue({
      items: [{ id: "vehicle-2", label: "XYZ-9876" }],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(
      <AppointmentFormSheet
        open
        onOpenChange={vi.fn()}
        appointment={{
          ...appointmentToEdit,
          extendedProps: {
            ...appointmentToEdit.extendedProps,
            vehicle: {
              ...appointmentToEdit.extendedProps.vehicle,
              currentResourceStatus: "DELETED",
            },
          },
        }}
      />,
    );

    const vehicleInput = screen.getByLabelText(/Veículo/);

    expect(vehicleInput).toBeDisabled();
    expect(screen.getByText("Removido")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Remover veículo ABC-1234/ }));

    expect(screen.getByText("Remover veículo deste agendamento?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remover veículo" }));

    await waitFor(() => {
      expect(vehicleInput).toBeEnabled();
    });
    expect(vehicleInput).toHaveValue("");

    await user.type(vehicleInput, "XYZ-9876");
    await user.click(screen.getByRole("button", { name: /Salvar altera/ }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          appointmentId: "appointment-1",
          body: {
            vehicleId: "vehicle-2",
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });
  });

  it("does not keep a removed deleted vehicle selectable from the snapshot", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useListCustomerVehicleOptionsMock.mockReturnValue({
      items: [],
      totalItems: 0,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(
      <AppointmentFormSheet
        open
        onOpenChange={vi.fn()}
        appointment={{
          ...appointmentToEdit,
          extendedProps: {
            ...appointmentToEdit.extendedProps,
            vehicle: {
              ...appointmentToEdit.extendedProps.vehicle,
              currentResourceStatus: "DELETED",
            },
          },
        }}
      />,
    );

    const vehicleInput = screen.getByLabelText(/Ve.culo/);

    await user.click(screen.getByRole("button", { name: /Remover ve.culo ABC-1234/ }));
    await user.click(screen.getByRole("button", { name: /Remover ve.culo$/ }));

    await waitFor(() => {
      expect(vehicleInput).toBeEnabled();
    });

    await user.type(vehicleInput, "ABC-1234");

    expect(screen.queryByText("Removido")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Salvar altera/ }));

    expect(await screen.findByText(/Selecione um ve.culo./)).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("does not keep the previous customer's vehicle selectable after changing customer", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useListCustomerOptionsMock.mockReturnValue({
      items: [{ id: "customer-2", label: "Anael" }],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useListCustomerVehicleOptionsMock.mockImplementation((filters?: { customerId?: string }) => ({
      items: filters?.customerId === "customer-1" ? [{ id: "vehicle-1", label: "ABC-1234" }] : [],
      totalItems: filters?.customerId === "customer-1" ? 1 : 0,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    }));
    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(<AppointmentFormSheet open onOpenChange={vi.fn()} appointment={appointmentToEdit} />);

    const customerInput = screen.getByLabelText(/Nome do cliente/);
    const vehicleInput = screen.getByLabelText(/Ve.culo/);

    await user.clear(customerInput);
    await user.type(customerInput, "Anael");

    await waitFor(() => {
      expect(vehicleInput).toBeEnabled();
    });

    expect(vehicleInput).toHaveValue("");

    await user.type(vehicleInput, "ABC-1234");
    await user.click(screen.getByRole("button", { name: /Salvar altera/ }));

    expect(await screen.findByText(/Selecione um ve.culo./)).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("sends the vehicle when an updated snapshot vehicle is reselected with the current label", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useListCustomerVehicleOptionsMock.mockReturnValue({
      items: [{ id: "vehicle-1", label: "Honda Civic atualizado" }],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(
      <AppointmentFormSheet
        open
        onOpenChange={vi.fn()}
        appointment={{
          ...appointmentToEdit,
          extendedProps: {
            ...appointmentToEdit.extendedProps,
            vehicle: {
              ...appointmentToEdit.extendedProps.vehicle,
              displayName: "Honda Civic antigo",
              currentResourceStatus: "UPDATED",
            },
          },
        }}
      />,
    );

    const vehicleInput = screen.getByLabelText(/Ve.culo/);

    expect(vehicleInput).toHaveValue("Honda Civic antigo");

    await user.clear(vehicleInput);
    await user.type(vehicleInput, "Honda Civic atualizado");
    await user.click(screen.getByRole("button", { name: /Salvar altera/ }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          appointmentId: "appointment-1",
          body: {
            vehicleId: "vehicle-1",
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });
  });

  it("locks the service selector until a changed snapshot service is removed", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useListServiceOptionsMock.mockReturnValue({
      items: [
        {
          id: "service-1",
          label: "Lavagem detalhada",
          priceSpecification: { type: "STARTING_AT", minPriceInCents: 4000 },
        },
      ],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(
      <AppointmentFormSheet
        open
        onOpenChange={vi.fn()}
        appointment={{
          ...appointmentToEdit,
          extendedProps: {
            ...appointmentToEdit.extendedProps,
            services: [
              {
                serviceId: "service-1",
                label: "Lavagem completa",
                priceInCents: 9000,
                currentResourceStatus: "UPDATED",
              },
            ],
          },
        }}
      />,
    );

    const servicesSelect = screen.getByLabelText(/Servi.os/);

    expect(servicesSelect).toBeDisabled();
    expect(
      screen.getByText("Remova os serviços atualizados ou removidos antes de alterar a lista."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Remover servi.o Lavagem completa/ }));

    expect(screen.getByText("Remover serviço deste agendamento?")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Isso remove "Lavagem completa" da edi..o atual e libera a sele..o de servi.os./,
      ),
    ).toBeInTheDocument();
    expect(servicesSelect).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Remover serviço" }));

    await waitFor(() => {
      expect(servicesSelect).toBeEnabled();
    });

    await user.type(screen.getByLabelText("Options search"), "Lavagem detalhada");
    await user.selectOptions(servicesSelect, "service-1");

    const servicePriceInput = screen.getByLabelText(/Valor do servi.*Lavagem detalhada/i);

    expect(servicePriceInput).toHaveValue("40,00");
    expect(servicePriceInput).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /Salvar altera/ }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          appointmentId: "appointment-1",
          body: {
            services: [{ serviceId: "service-1", priceInCents: 4000 }],
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });
  });

  it("sends services when a changed snapshot service is reselected with the same price", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useListServiceOptionsMock.mockReturnValue({
      items: [
        {
          id: "service-1",
          label: "Lavagem detalhada",
          priceSpecification: { type: "STARTING_AT", minPriceInCents: 9000 },
        },
      ],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(
      <AppointmentFormSheet
        open
        onOpenChange={vi.fn()}
        appointment={{
          ...appointmentToEdit,
          extendedProps: {
            ...appointmentToEdit.extendedProps,
            services: [
              {
                serviceId: "service-1",
                label: "Lavagem completa",
                priceInCents: 9000,
                currentResourceStatus: "UPDATED",
              },
            ],
          },
        }}
      />,
    );

    const servicesSelect = screen.getByLabelText(/Servi.os/);

    await user.click(screen.getByRole("button", { name: /Remover servi.o Lavagem completa/ }));
    await user.click(screen.getByRole("button", { name: /Remover servi.o$/ }));

    await waitFor(() => {
      expect(servicesSelect).toBeEnabled();
    });

    await user.type(screen.getByLabelText("Options search"), "Lavagem detalhada");
    await user.selectOptions(servicesSelect, "service-1");
    await user.click(screen.getByRole("button", { name: /Salvar altera/ }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          appointmentId: "appointment-1",
          body: {
            services: [{ serviceId: "service-1", priceInCents: 9000 }],
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });
    expect(toastInfoMock).not.toHaveBeenCalledWith("Nenhuma alteraÃ§Ã£o para salvar.");
  });

  it("does not keep a removed deleted snapshot service in the selector options", async () => {
    const user = userEvent.setup();

    useListServiceOptionsMock.mockReturnValue({
      items: [],
      totalItems: 0,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });

    render(
      <AppointmentFormSheet
        open
        onOpenChange={vi.fn()}
        appointment={{
          ...appointmentToEdit,
          extendedProps: {
            ...appointmentToEdit.extendedProps,
            services: [
              {
                serviceId: "service-1",
                label: "Lavagem completa",
                priceInCents: 9000,
                currentResourceStatus: "DELETED",
              },
            ],
          },
        }}
      />,
    );

    const servicesSelect = screen.getByLabelText(/Servi.os/);

    expect(servicesSelect).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Remover servi.o Lavagem completa/ }));
    await user.click(screen.getByRole("button", { name: /Remover servi.o$/ }));

    await waitFor(() => {
      expect(servicesSelect).toBeEnabled();
    });

    expect(screen.queryByRole("option", { name: "Lavagem completa" })).not.toBeInTheDocument();
  });

  it("shows feedback instead of updating when an edit submit has no changed fields", async () => {
    const mutate = vi.fn();

    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(<AppointmentFormSheet open onOpenChange={vi.fn()} appointment={appointmentToEdit} />);

    const submitButton = screen.getByRole("button", { name: "Salvar alterações" });

    expect(submitButton).toBeDisabled();

    fireEvent.submit(submitButton.closest("form")!);

    await waitFor(() => {
      expect(toastInfoMock).toHaveBeenCalledWith("Nenhuma alteração para salvar.");
    });
    expect(mutate).not.toHaveBeenCalled();
  });

  it("does not validate the vehicle field when the customer changes", async () => {
    const user = userEvent.setup();

    useListCustomerOptionsMock.mockReturnValue({
      items: [{ id: "customer-1", label: "Cliente Teste" }],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
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

  it("blocks editing and communicates progress while updating the appointment", () => {
    useUpdateAppointmentMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });

    render(<AppointmentFormSheet open onOpenChange={vi.fn()} appointment={appointmentToEdit} />);

    expect(screen.getByRole("status")).toHaveTextContent("Atualizando agendamento...");
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();

    const submitButton = screen.getByRole("button", { name: "Atualizando..." });

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
      items: [{ id: "customer-1", label: "Cliente Teste" }],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useListCustomerVehicleOptionsMock.mockReturnValue({
      items: [{ id: "vehicle-1", label: "ABC-1234" }],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useListServiceOptionsMock.mockReturnValue({
      items: [
        {
          id: "service-1",
          label: "Lavagem completa",
          priceSpecification: { type: "FIXED", fixedPriceInCents: 9000 },
        },
      ],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
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

    const servicePriceInput = screen.getByLabelText(/Valor do serviço: Lavagem completa/i);

    expect(servicePriceInput).toHaveValue("90,00");
    expect(servicePriceInput).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Salvar agendamento" }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: "customer-1",
          discountInCents: null,
          services: [{ serviceId: "service-1", priceInCents: 9000 }],
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

  it("sends discount changes as cents in the update payload", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(<AppointmentFormSheet open onOpenChange={vi.fn()} appointment={appointmentToEdit} />);

    const discountInput = screen.getByLabelText(/Desconto/);

    fireEvent.change(discountInput, { target: { value: "20,00" } });
    fireEvent.blur(discountInput);

    await user.click(screen.getByRole("button", { name: /Salvar altera/ }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          appointmentId: "appointment-1",
          body: {
            discountInCents: 2000,
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });
  });

  it("blocks discount changes above the appointment services total", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(<AppointmentFormSheet open onOpenChange={vi.fn()} appointment={appointmentToEdit} />);

    const discountInput = screen.getByLabelText(/Desconto/);

    fireEvent.change(discountInput, { target: { value: "90,01" } });
    fireEvent.blur(discountInput);

    await user.click(screen.getByRole("button", { name: /Salvar altera/ }));

    expect(
      await screen.findByText("O desconto não pode ser maior que o valor total dos serviços."),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("keeps an existing appointment service price read-only when catalog metadata is unavailable", async () => {
    render(<AppointmentFormSheet open onOpenChange={vi.fn()} appointment={appointmentToEdit} />);

    const servicePriceInput = screen.getByLabelText(/Valor do servi.*Lavagem completa/i);

    expect(servicePriceInput).toHaveValue("90,00");
    expect(servicePriceInput).toBeDisabled();
    expect(screen.getByText("Valor fixo: 90,00")).toBeInTheDocument();
  });

  it("keeps changed snapshot service price read-only when current catalog metadata changed", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useListServiceOptionsMock.mockReturnValue({
      items: [
        {
          id: "service-1",
          label: "Lavagem detalhada",
          priceSpecification: { type: "FIXED", fixedPriceInCents: 12000 },
        },
      ],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(
      <AppointmentFormSheet
        open
        onOpenChange={vi.fn()}
        appointment={{
          ...appointmentToEdit,
          extendedProps: {
            ...appointmentToEdit.extendedProps,
            services: [
              {
                serviceId: "service-1",
                label: "Lavagem completa",
                priceInCents: 9000,
                currentResourceStatus: "UPDATED",
              },
            ],
          },
        }}
      />,
    );

    const servicePriceInput = screen.getByLabelText(/Valor do servi.*Lavagem completa/i);

    await waitFor(() => {
      expect(servicePriceInput).toHaveValue("90,00");
    });
    expect(servicePriceInput).toBeDisabled();
    expect(screen.getByText("Valor registrado: 90,00")).toBeInTheDocument();

    const descriptionInput = screen.getByLabelText(/Descri..o/);

    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Nova observaÃ§Ã£o");
    await user.click(screen.getByRole("button", { name: /Salvar altera/ }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          appointmentId: "appointment-1",
          body: {
            description: "Nova observaÃ§Ã£o",
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });
  });

  it("allows editing an unchanged non-fixed snapshot service price", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useListServiceOptionsMock.mockReturnValue({
      items: [
        {
          id: "service-1",
          label: "Lavagem completa",
          priceSpecification: { type: "STARTING_AT", minPriceInCents: 4000 },
        },
      ],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(<AppointmentFormSheet open onOpenChange={vi.fn()} appointment={appointmentToEdit} />);

    const servicePriceInput = screen.getByLabelText(/Valor do servi.*Lavagem completa/i);

    await waitFor(() => {
      expect(screen.getByText(/M.nimo permitido: 40,00/)).toBeInTheDocument();
    });
    expect(servicePriceInput).toHaveValue("90,00");
    expect(servicePriceInput).toBeEnabled();

    fireEvent.change(servicePriceInput, { target: { value: "10,00" } });
    fireEvent.blur(servicePriceInput);

    expect(
      await screen.findByText(/O valor n.o pode ser menor que o m.nimo do servi.o./),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();

    fireEvent.change(servicePriceInput, { target: { value: "100,00" } });
    fireEvent.blur(servicePriceInput);

    await user.click(screen.getByRole("button", { name: /Salvar altera/ }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          appointmentId: "appointment-1",
          body: {
            services: [{ serviceId: "service-1", priceInCents: 10000 }],
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });
  });

  it("uses current catalog label and price after removing and reselecting a snapshot service", async () => {
    const user = userEvent.setup();

    useListServiceOptionsMock.mockReturnValue({
      items: [
        {
          id: "service-1",
          label: "Lavagem detalhada",
          priceSpecification: { type: "STARTING_AT", minPriceInCents: 4000 },
        },
      ],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });

    render(<AppointmentFormSheet open onOpenChange={vi.fn()} appointment={appointmentToEdit} />);

    const servicesSelect = screen.getByLabelText(/Servi.os/);

    await user.type(screen.getByLabelText("Options search"), "Lavagem detalhada");
    await user.selectOptions(servicesSelect, "");
    await user.selectOptions(servicesSelect, "service-1");

    const servicePriceInput = screen.getByLabelText(/Valor do servi.*Lavagem detalhada/i);

    expect(servicePriceInput).toHaveValue("40,00");
    expect(servicePriceInput).toBeEnabled();
    expect(screen.getByText(/M.nimo permitido: 40,00/)).toBeInTheDocument();
  });

  it("clears the appointment end date when the clear button is clicked", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useUpdateAppointmentMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(<AppointmentFormSheet open onOpenChange={vi.fn()} appointment={appointmentToEdit} />);

    await user.click(screen.getByRole("button", { name: "Limpar data de encerramento" }));

    expect(screen.getAllByTestId("date-picker-time")[1]).toHaveTextContent("empty");

    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          appointmentId: "appointment-1",
          body: {
            endsAt: null,
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });
  });

  it("shows a form error when a starting-at service price is below the minimum", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useListCustomerOptionsMock.mockReturnValue({
      items: [{ id: "customer-1", label: "Cliente Teste" }],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useListCustomerVehicleOptionsMock.mockReturnValue({
      items: [{ id: "vehicle-1", label: "ABC-1234" }],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useListServiceOptionsMock.mockReturnValue({
      items: [
        {
          id: "service-1",
          label: "Lavagem completa",
          priceSpecification: { type: "STARTING_AT", minPriceInCents: 9000 },
        },
      ],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useCreateAppointmentMock.mockReturnValue({
      mutate,
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
    await user.selectOptions(screen.getByLabelText(/Serviços/), "service-1");
    await user.type(screen.getByLabelText(/Veículo/), "ABC-1234");

    const servicePriceInput = screen.getByLabelText(/Valor do serviço: Lavagem completa/i);
    expect(servicePriceInput).toHaveValue("90,00");

    fireEvent.change(servicePriceInput, { target: { value: "10,00" } });
    fireEvent.blur(servicePriceInput);

    expect(servicePriceInput).toHaveValue("10,00");
    expect(
      await screen.findByText("O valor não pode ser menor que o mínimo do serviço."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Salvar agendamento" }));

    expect(mutate).not.toHaveBeenCalled();
  });

  it("shows a form error when a range service price is above the maximum", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    useListCustomerOptionsMock.mockReturnValue({
      items: [{ id: "customer-1", label: "Cliente Teste" }],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useListCustomerVehicleOptionsMock.mockReturnValue({
      items: [{ id: "vehicle-1", label: "ABC-1234" }],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useListServiceOptionsMock.mockReturnValue({
      items: [
        {
          id: "service-1",
          label: "Polimento",
          priceSpecification: {
            type: "RANGE",
            minPriceInCents: 5000,
            maxPriceInCents: 10000,
          },
        },
      ],
      totalItems: 1,
      hasMore: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
      isPending: false,
    });
    useCreateAppointmentMock.mockReturnValue({
      mutate,
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
    await user.selectOptions(screen.getByLabelText(/Serviços/), "service-1");
    await user.type(screen.getByLabelText(/Veículo/), "ABC-1234");

    const servicePriceInput = screen.getByLabelText(/Valor do serviço: Polimento/i);

    expect(servicePriceInput).toHaveValue("50,00");
    expect(screen.getByText("Permitido: 50,00 a 100,00")).toBeInTheDocument();

    fireEvent.change(servicePriceInput, { target: { value: "150,00" } });
    fireEvent.blur(servicePriceInput);

    expect(servicePriceInput).toHaveValue("150,00");
    expect(
      await screen.findByText("O valor não pode ultrapassar o máximo do serviço."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Salvar agendamento" }));

    expect(mutate).not.toHaveBeenCalled();
  });
});
