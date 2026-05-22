type AppointmentStatus = "SCHEDULED" | "DONE" | "CANCELLED";

type AppointmentFixture = {
  id: string;
  serviceName: string;
  startsAt: string;
  endsAt: string;
  status?: AppointmentStatus;
  vehicle?: {
    plate: string | null;
    brand: string | null;
    model: string | null;
    color: string | null;
    year: number | null;
  } | null;
};

type AppointmentRecord = {
  id: string;
  establishmentId: string;
  customerId: string;
  vehicleId: string | null;
  services: {
    id: string;
    name: string;
    category: null;
    durationInMinutes: number;
    priceInCents: number;
  }[];
  vehicle: AppointmentFixture["vehicle"];
  startsAt: string;
  endsAt: string;
  description: string;
  discountInCents: null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  doneAt: string | null;
  cancelledAt: string | null;
};

type StubAppointmentsOptions = {
  appointments?: AppointmentRecord[];
  status?: number;
  delayMs?: number;
  alias?: string;
};

const currentDate = new Date(2026, 4, 22, 9, 0, 0);

const defaultVehicle = {
  plate: "ABC-1234",
  brand: "Volvo",
  model: "XC40",
  color: "Azul",
  year: 2024,
};

function buildAppointment({
  id,
  serviceName,
  startsAt,
  endsAt,
  status = "SCHEDULED",
  vehicle = defaultVehicle,
}: AppointmentFixture): AppointmentRecord {
  return {
    id,
    establishmentId: "establishment-1",
    customerId: `customer-${id}`,
    vehicleId: vehicle ? `vehicle-${id}` : null,
    services: [
      {
        id: `service-${id}`,
        name: serviceName,
        category: null,
        durationInMinutes: 35,
        priceInCents: 9000,
      },
    ],
    vehicle,
    startsAt,
    endsAt,
    description: `Observação ${serviceName}`,
    discountInCents: null,
    status,
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z",
    doneAt: status === "DONE" ? endsAt : null,
    cancelledAt: status === "CANCELLED" ? startsAt : null,
  };
}

function buildCrowdedDayAppointments() {
  return Array.from({ length: 7 }, (_, index) =>
    buildAppointment({
      id: `crowded-${index + 1}`,
      serviceName: `Serviço lotado ${index + 1}`,
      startsAt: `2026-05-23T${String(8 + index).padStart(2, "0")}:00:00`,
      endsAt: `2026-05-23T${String(8 + index).padStart(2, "0")}:35:00`,
    }),
  );
}

const defaultAppointments = [
  buildAppointment({
    id: "appointment-1",
    serviceName: "Lavagem Express",
    startsAt: "2026-05-22T10:00:00",
    endsAt: "2026-05-22T10:35:00",
  }),
  buildAppointment({
    id: "appointment-2",
    serviceName: "Higienização Interna",
    startsAt: "2026-05-22T11:00:00",
    endsAt: "2026-05-22T11:35:00",
    vehicle: {
      plate: "XYZ-9876",
      brand: "BMW",
      model: "320i",
      color: "Preto",
      year: 2023,
    },
  }),
  buildAppointment({
    id: "appointment-3",
    serviceName: "Polimento Técnico",
    startsAt: "2026-05-24T16:30:00",
    endsAt: "2026-05-24T17:05:00",
    status: "DONE",
  }),
];

function stubAppointments({
  appointments = defaultAppointments,
  status = 200,
  delayMs = 0,
  alias = "appointmentsRequest",
}: StubAppointmentsOptions = {}) {
  cy.intercept("GET", "**/appointments/calendar*", {
    statusCode: status,
    delay: delayMs,
    body: status >= 400 ? { message: "Falha ao carregar agendamentos" } : { appointments },
  }).as(alias);
}

function stubAppointmentsSequence(responses: StubAppointmentsOptions[]) {
  let callCount = 0;

  cy.intercept("GET", "**/appointments/calendar*", (request) => {
    const response = responses[Math.min(callCount, responses.length - 1)] ?? {};
    const status = response.status ?? 200;
    callCount += 1;

    request.reply({
      statusCode: status,
      delay: response.delayMs ?? 0,
      body:
        status >= 400
          ? { message: "Falha ao carregar agendamentos" }
          : { appointments: response.appointments ?? defaultAppointments },
    });
  }).as("appointmentsRequest");
}

function visitAppointments() {
  cy.clock(currentDate.getTime(), ["Date"]);
  cy.stubLogin();
  cy.visit("/appointments");
}

describe("Appointments page", () => {
  it("renders the authenticated appointments screen with calendar data and agenda summary", () => {
    stubAppointments();
    visitAppointments();

    cy.wait("@appointmentsRequest").then(({ request }) => {
      const requestUrl = new URL(request.url);

      expect(requestUrl.pathname).to.equal("/appointments/calendar");
      expect(requestUrl.searchParams.has("startsAt")).to.equal(true);
      expect(requestUrl.searchParams.has("endsAt")).to.equal(true);
    });

    cy.url().should("include", "/appointments");
    cy.contains("Período visível").should("be.visible");
    cy.contains("Dia selecionado").should("be.visible");
    cy.contains("Visualização").should("be.visible");
    cy.contains("3 agendamentos").should("be.visible");
    cy.contains("2 agendamentos").should("be.visible");
    cy.get(".fc").should("be.visible");
    cy.contains(".fc-event", "Lavagem Express").should("be.visible");
    cy.contains("Agenda do dia").should("be.visible");
    cy.contains(/sexta-feira, 22 de maio/i).should("be.visible");
    cy.contains("Volvo • XC40 • ABC-1234").should("be.visible");
  });

  it("shows the loading state while appointments are being fetched", () => {
    stubAppointments({ delayMs: 800 });
    visitAppointments();

    cy.contains("Carregando agendamentos...").should("be.visible");
    cy.contains("Carregando agenda do dia.").should("be.visible");

    cy.wait("@appointmentsRequest");
    cy.contains("Carregando agendamentos...").should("not.exist");
    cy.contains("Lavagem Express").should("be.visible");
  });

  it("shows the empty state when the selected day has no appointments", () => {
    stubAppointments({ appointments: [] });
    visitAppointments();

    cy.wait("@appointmentsRequest");

    cy.contains("0 agendamentos").should("be.visible");
    cy.contains("Nenhum agendamento neste dia.").should("be.visible");
    cy.contains("Agenda do dia").should("be.visible");
  });

  it("shows the error state and reloads appointments with the retry action", () => {
    stubAppointmentsSequence([
      { status: 500 },
      { appointments: defaultAppointments },
      { appointments: defaultAppointments },
    ]);
    visitAppointments();

    cy.wait("@appointmentsRequest");

    cy.contains("Não foi possível carregar os agendamentos.").should("be.visible");
    cy.contains("Não foi possível carregar a agenda.").should("be.visible");

    cy.contains("button", /^Tentar novamente$/i).click();
    cy.wait("@appointmentsRequest");

    cy.contains("Lavagem Express").should("be.visible");
    cy.contains("Não foi possível carregar os agendamentos.").should("not.exist");
  });

  it("switches to daily view and keeps short-event time visible beside the title", () => {
    stubAppointments();
    visitAppointments();

    cy.wait("@appointmentsRequest");
    cy.get('[role="combobox"]').click();
    cy.contains('[role="option"]', "Visão diária").click();

    cy.contains("Visão diária").should("be.visible");
    cy.contains(".fc-timegrid-event", "Lavagem Express").within(() => {
      cy.contains("10:00").should("be.visible");
    });
  });

  it("opens the more appointments popover and closes it when the page scrolls", () => {
    stubAppointments({
      appointments: [...defaultAppointments, ...buildCrowdedDayAppointments()],
    });
    visitAppointments();

    cy.wait("@appointmentsRequest");
    cy.contains(/mais \d+ agendamentos/i).click();

    cy.get(".fc-more-popover").should("be.visible");
    cy.contains(".fc-more-popover", "Serviço lotado").should("be.visible");

    cy.scrollTo("bottom");

    cy.get(".fc-more-popover").should("not.exist");
  });

  it("keeps the appointments layout usable without horizontal overflow on mobile", () => {
    cy.viewport(390, 844);
    stubAppointments();
    visitAppointments();

    cy.wait("@appointmentsRequest");

    cy.contains("Visão mensal").should("be.visible");
    cy.contains("Agenda do dia").scrollIntoView().should("be.visible");
    cy.window().then((window) => {
      const documentWidth = window.document.documentElement.scrollWidth;

      expect(documentWidth).to.be.at.most(window.innerWidth + 1);
    });
  });
});
