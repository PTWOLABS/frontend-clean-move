import {
  addDays,
  addMinutes,
  format,
  isSameDay,
  isSameMonth,
  isSameYear,
  set,
  startOfDay,
  subMinutes,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import type {
  AppointmentCalendarEvent,
  AppointmentCalendarView,
  AppointmentExtendedProps,
  AppointmentMockStatus,
} from "../types/appointment-calendar";

type ScheduledMockTemplate = AppointmentExtendedProps & {
  title: string;
  dayOffset: number;
  hours: number;
  minutes: number;
  durationInMinutes: number;
};

type DraftMockTemplate = Omit<ScheduledMockTemplate, "dayOffset" | "hours" | "minutes">;

const scheduledTemplates: ScheduledMockTemplate[] = [
  {
    title: "Lavagem premium",
    customer: "Camila Moreira",
    service: "Lavagem premium com secagem técnica",
    vehicle: "Jeep Compass",
    attendants: ["Rafael", "Nina"],
    notes: "Cliente prefere retirada rápida na recepção.",
    reminder: "20 min antes",
    tone: "info",
    status: "FINISHED",
    dayOffset: -6,
    hours: 8,
    minutes: 30,
    durationInMinutes: 90,
  },
  {
    title: "Polimento técnico",
    customer: "Leandro Lima",
    service: "Polimento técnico + vitrificação leve",
    vehicle: "Corolla Cross",
    attendants: ["Bianca", "Murilo"],
    notes: "Validar fotos antes da entrega.",
    reminder: "30 min antes",
    tone: "primary",
    status: "FINISHED",
    dayOffset: -3,
    hours: 10,
    minutes: 0,
    durationInMinutes: 150,
  },
  {
    title: "Higienização interna",
    customer: "Fernanda Costa",
    service: "Higienização interna completa",
    vehicle: "Honda HR-V",
    attendants: ["Duda", "Yuri"],
    notes: "Cadeirinha infantil no porta-malas.",
    reminder: "15 min antes",
    tone: "success",
    status: "CONFIRMED",
    dayOffset: 0,
    hours: 9,
    minutes: 0,
    durationInMinutes: 120,
  },
  {
    title: "Vitrificação rápida",
    customer: "Marcelo Prado",
    service: "Vitrificação de manutenção",
    vehicle: "Volvo XC40",
    attendants: ["Rafael", "Nina"],
    notes: "Aplicar check-list com luz fria no final.",
    reminder: "10 min antes",
    tone: "accent",
    status: "CHECK_IN",
    dayOffset: 0,
    hours: 13,
    minutes: 30,
    durationInMinutes: 90,
  },
  {
    title: "Revisão de orçamento",
    customer: "Patrícia Gomes",
    service: "Avaliação para detalhamento externo",
    vehicle: "Fiat Fastback",
    attendants: ["Murilo"],
    notes: "Atendimento consultivo, sem box reservado.",
    reminder: "No horário",
    tone: "warning",
    status: "WAITING",
    dayOffset: 1,
    hours: 8,
    minutes: 0,
    durationInMinutes: 45,
  },
  {
    title: "Lavagem executiva",
    customer: "Henrique Alves",
    service: "Lavagem executiva com proteção rápida",
    vehicle: "BMW 320i",
    attendants: ["Duda", "Caio"],
    notes: "Confirmar pagamento no balcão ao concluir.",
    reminder: "25 min antes",
    tone: "info",
    status: "CONFIRMED",
    dayOffset: 1,
    hours: 11,
    minutes: 0,
    durationInMinutes: 75,
  },
  {
    title: "Motor detalhado",
    customer: "Sofia Nogueira",
    service: "Detalhamento de motor com proteção",
    vehicle: "Ford Ranger",
    attendants: ["Caio", "Yuri"],
    notes: "Separar protetor plástico para central multimídia.",
    reminder: "40 min antes",
    tone: "danger",
    status: "WAITING",
    dayOffset: 2,
    hours: 14,
    minutes: 0,
    durationInMinutes: 120,
  },
  {
    title: "Proteção cerâmica",
    customer: "Bruno Farias",
    service: "Aplicação de proteção cerâmica",
    vehicle: "Audi Q3",
    attendants: ["Bianca", "Murilo"],
    notes: "Reservar box 2 e iluminação lateral.",
    reminder: "45 min antes",
    tone: "primary",
    status: "CONFIRMED",
    dayOffset: 3,
    hours: 7,
    minutes: 30,
    durationInMinutes: 180,
  },
  {
    title: "Couro e acabamento",
    customer: "Helena Duarte",
    service: "Higienização de couro e acabamento interno",
    vehicle: "Toyota SW4",
    attendants: ["Nina"],
    notes: "Cliente busca no fim da tarde.",
    reminder: "20 min antes",
    tone: "accent",
    status: "CONFIRMED",
    dayOffset: 4,
    hours: 16,
    minutes: 0,
    durationInMinutes: 90,
  },
  {
    title: "Couro e acabamento",
    customer: "Helena Duarte",
    service: "Higienização de couro e acabamento interno",
    vehicle: "Toyota SW4",
    attendants: ["Nina"],
    notes: "Cliente busca no fim da tarde.",
    reminder: "20 min antes",
    tone: "accent",
    status: "CONFIRMED",
    dayOffset: 4,
    hours: 16,
    minutes: 0,
    durationInMinutes: 90,
  },
  {
    title: "Couro e acabamento",
    customer: "Helena Duarte",
    service: "Higienização de couro e acabamento interno",
    vehicle: "Toyota SW4",
    attendants: ["Nina"],
    notes: "Cliente busca no fim da tarde.",
    reminder: "20 min antes",
    tone: "accent",
    status: "CONFIRMED",
    dayOffset: 4,
    hours: 16,
    minutes: 0,
    durationInMinutes: 90,
  },
  {
    title: "Couro e acabamento",
    customer: "Helena Duarte",
    service: "Higienização de couro e acabamento interno",
    vehicle: "Toyota SW4",
    attendants: ["Nina"],
    notes: "Cliente busca no fim da tarde.",
    reminder: "20 min antes",
    tone: "accent",
    status: "CONFIRMED",
    dayOffset: 4,
    hours: 16,
    minutes: 0,
    durationInMinutes: 90,
  },
  {
    title: "Couro e acabamento",
    customer: "Helena Duarte",
    service: "Higienização de couro e acabamento interno",
    vehicle: "Toyota SW4",
    attendants: ["Nina"],
    notes: "Cliente busca no fim da tarde.",
    reminder: "20 min antes",
    tone: "accent",
    status: "CONFIRMED",
    dayOffset: 4,
    hours: 16,
    minutes: 0,
    durationInMinutes: 90,
  },
  {
    title: "Lavagem express",
    customer: "Pedro Arantes",
    service: "Lavagem expressa de manutenção",
    vehicle: "VW T-Cross",
    attendants: ["Yuri"],
    notes: "Atendimento recorrente do clube mensal.",
    reminder: "5 min antes",
    tone: "success",
    status: "WAITING",
    dayOffset: 7,
    hours: 9,
    minutes: 30,
    durationInMinutes: 60,
  },
  {
    title: "Retoque final",
    customer: "Juliana Pires",
    service: "Retoque final e inspeção de entrega",
    vehicle: "Mercedes GLA",
    attendants: ["Rafael", "Caio"],
    notes: "Garantir fotos de antes e depois.",
    reminder: "30 min antes",
    tone: "warning",
    status: "CONFIRMED",
    dayOffset: 9,
    hours: 15,
    minutes: 0,
    durationInMinutes: 60,
  },
  {
    title: "Entrega pós-serviço",
    customer: "Vinícius Teixeira",
    service: "Apresentação final e checklist de entrega",
    vehicle: "Porsche Macan",
    attendants: ["Bianca"],
    notes: "Cliente quer revisar plano de manutenção futura.",
    reminder: "No horário",
    tone: "info",
    status: "CONFIRMED",
    dayOffset: 11,
    hours: 10,
    minutes: 0,
    durationInMinutes: 45,
  },
];

const draftTemplates: DraftMockTemplate[] = [
  {
    title: "Novo atendimento",
    customer: "Cliente walk-in",
    service: "Lavagem de manutenção",
    vehicle: "Veículo a confirmar",
    attendants: ["Equipe A"],
    notes: "Agendamento mockado localmente para validação de fluxo.",
    reminder: "15 min antes",
    tone: "primary",
    status: "CONFIRMED",
    durationInMinutes: 60,
  },
  {
    title: "Avaliação técnica",
    customer: "Orçamento presencial",
    service: "Avaliação de detalhamento completo",
    vehicle: "Modelo informado no atendimento",
    attendants: ["Consultor de pátio"],
    notes: "Usar este mock para validar encaixes rápidos no calendário.",
    reminder: "No horário",
    tone: "accent",
    status: "WAITING",
    durationInMinutes: 45,
  },
  {
    title: "Retorno de pós-venda",
    customer: "Base recorrente",
    service: "Inspeção pós-serviço e manutenção",
    vehicle: "Cadastro já existente",
    attendants: ["Equipe B"],
    notes: "Mock criado a partir do slot selecionado.",
    reminder: "10 min antes",
    tone: "success",
    status: "CHECK_IN",
    durationInMinutes: 30,
  },
];

function sortAppointmentsByStart(left: AppointmentCalendarEvent, right: AppointmentCalendarEvent) {
  return left.start.getTime() - right.start.getTime();
}

function buildScheduledDate(baseDate: Date, dayOffset: number, hours: number, minutes: number) {
  return set(addDays(startOfDay(baseDate), dayOffset), {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  });
}

function resolveMockStart(date: Date, dayAppointments: AppointmentCalendarEvent[]) {
  if (date.getHours() !== 0 || date.getMinutes() !== 0) {
    return set(date, {
      seconds: 0,
      milliseconds: 0,
    });
  }

  const lastAppointment = dayAppointments.at(-1);

  if (lastAppointment) {
    return addMinutes(lastAppointment.end, 30);
  }

  return set(startOfDay(date), {
    hours: 9,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
}

export function buildInitialMockAppointments(anchorDate: Date = new Date()) {
  return scheduledTemplates
    .map((template, index) => {
      const start = buildScheduledDate(
        anchorDate,
        template.dayOffset,
        template.hours,
        template.minutes,
      );

      return {
        id: `appointment-${index + 1}`,
        title: template.title,
        start,
        end: addMinutes(start, template.durationInMinutes),
        extendedProps: {
          customer: template.customer,
          service: template.service,
          vehicle: template.vehicle,
          attendants: template.attendants,
          notes: template.notes,
          reminder: template.reminder,
          tone: template.tone,
          status: template.status,
        },
      } satisfies AppointmentCalendarEvent;
    })
    .sort(sortAppointmentsByStart);
}

export function buildMockAppointment(
  date: Date,
  sequence: number,
  dayAppointments: AppointmentCalendarEvent[],
) {
  const template = draftTemplates[sequence % draftTemplates.length];
  const start = resolveMockStart(date, dayAppointments);

  return {
    id: `appointment-draft-${start.getTime()}-${sequence}`,
    title: template.title,
    start,
    end: addMinutes(start, template.durationInMinutes),
    extendedProps: {
      customer: template.customer,
      service: template.service,
      vehicle: template.vehicle,
      attendants: template.attendants,
      notes: template.notes,
      reminder: template.reminder,
      tone: template.tone,
      status: template.status,
    },
  } satisfies AppointmentCalendarEvent;
}

export function getAppointmentsForDate(events: AppointmentCalendarEvent[], date: Date) {
  return events.filter((event) => isSameDay(event.start, date)).sort(sortAppointmentsByStart);
}

export function findNextAppointment(events: AppointmentCalendarEvent[], now: Date = new Date()) {
  return (
    events
      .filter((event) => event.start.getTime() >= now.getTime())
      .sort(sortAppointmentsByStart)[0] ?? null
  );
}

export function formatCalendarRange(start: Date, endExclusive: Date) {
  const inclusiveEnd = subMinutes(endExclusive, 1);
  const startLabel = format(start, "d 'de' MMMM", { locale: ptBR });
  const endLabel = format(
    inclusiveEnd,
    isSameYear(start, inclusiveEnd) ? "d 'de' MMMM 'de' yyyy" : "d 'de' MMMM 'de' yyyy",
    { locale: ptBR },
  );

  if (isSameMonth(start, inclusiveEnd) && isSameYear(start, inclusiveEnd)) {
    return `${startLabel} - ${endLabel}`;
  }

  if (isSameYear(start, inclusiveEnd)) {
    return `${startLabel} - ${endLabel}`;
  }

  return `${format(start, "d 'de' MMMM 'de' yyyy", { locale: ptBR })} - ${endLabel}`;
}

export function getViewLabel(view: AppointmentCalendarView) {
  switch (view) {
    case "dayGridMonth":
      return "Visão mensal";
    case "timeGridWeek":
      return "Visão semanal";
    case "timeGridDay":
      return "Visão diária";
  }
}

export function getStatusLabel(status: AppointmentMockStatus) {
  switch (status) {
    case "CONFIRMED":
      return "Confirmado";
    case "CHECK_IN":
      return "Em andamento";
    case "WAITING":
      return "Aguardando";
    case "FINISHED":
      return "Finalizado";
  }
}
