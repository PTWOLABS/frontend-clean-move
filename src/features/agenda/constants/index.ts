import type {
  AgendaPeriodMode,
  AgendaSearchField,
  AgendaStatusFilter,
} from "@/features/agenda/types";

export const AGENDA_PAGE_SIZE = 5;
export const SEARCH_DEBOUNCE_MS = 350;

export const statusFilterOptions: Array<{
  label: string;
  value: AgendaStatusFilter;
}> = [
  {
    label: "Todos os status",
    value: "ALL",
  },
  {
    label: "Agendado",
    value: "SCHEDULED",
  },
  {
    label: "Concluído",
    value: "DONE",
  },
  {
    label: "Cancelado",
    value: "CANCELLED",
  },
];

export const searchFieldOptions: Array<{
  label: string;
  value: AgendaSearchField;
}> = [
  {
    label: "Nome do serviço",
    value: "serviceName",
  },
  {
    label: "Modelo do veículo",
    value: "vehicleModel",
  },
  {
    label: "Marca do veículo",
    value: "vehicleBrand",
  },
  {
    label: "Placa do veículo",
    value: "vehiclePlate",
  },
  {
    label: "Apelido do cliente",
    value: "customerNickname",
  },
  {
    label: "Nome do cliente",
    value: "customerName",
  },
];

export const periodModeOptions: Array<{
  label: string;
  value: AgendaPeriodMode;
}> = [
  {
    label: "Período selecionado",
    value: "custom",
  },
  {
    label: "Todo o período",
    value: "all",
  },
];
