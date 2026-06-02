type AppointmentStatus = "SCHEDULED" | "DONE" | "CANCELLED";

type AppointmentFixture = {
  id: string;
  serviceName: string;
  startsAt: string;
  endsAt: string;
  status?: AppointmentStatus;
  customerName?: string;
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
  customer: {
    fullName: string;
  };
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

type AppointmentRequestBody = {
  customerId: string;
  serviceIds: string[];
  vehicleId: string;
  startsAt: string;
  endsAt: string | null;
  description: string | null;
  discountValue: string;
};

type StubMutationOptions = {
  status?: number;
  delayMs?: number;
  alias?: string;
  onRequest?: () => void;
};

const currentDate = new Date(2026, 4, 22, 9, 0, 0);

const customerOption = {
  id: "customer-new",
  label: "Ana Martins",
};

const vehicleOption = {
  id: "vehicle-new",
  label: "Volvo XC40 ABC-1234",
};

const serviceOption = {
  id: "service-new",
  label: "Lavagem completa",
};

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
  customerName = "Ana Martins",
  vehicle = defaultVehicle,
}: AppointmentFixture): AppointmentRecord {
  return {
    id,
    establishmentId: "establishment-1",
    customerId: `customer-${id}`,
    customer: {
      fullName: customerName,
    },
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

function queryParamIncludes(url: string, paramName: string, expectedValue: string) {
  const requestUrl = new URL(url);

  return [paramName, `${paramName}[]`].some((name) =>
    requestUrl.searchParams.getAll(name).includes(expectedValue),
  );
}

function stubAppointmentFormOptions() {
  cy.intercept("GET", "**/customers/options*", {
    statusCode: 200,
    body: {
      customers: [customerOption],
    },
  }).as("customerOptionsRequest");

  cy.intercept("GET", "**/vehicles/options*", (request) => {
    const requestUrl = new URL(request.url);

    expect(requestUrl.searchParams.get("customerId")).to.be.oneOf([
      customerOption.id,
      "customer-appointment-1",
    ]);

    request.reply({
      statusCode: 200,
      body: {
        vehicles: [vehicleOption],
      },
    });
  }).as("vehicleOptionsRequest");

  cy.intercept("GET", "**/services/options*", {
    statusCode: 200,
    body: {
      services: [serviceOption],
    },
  }).as("serviceOptionsRequest");
}

function stubCreateAppointment({
  status = 201,
  delayMs = 0,
  alias = "createAppointmentRequest",
}: StubMutationOptions = {}) {
  cy.intercept("POST", "**/appointments", {
    statusCode: status,
    delay: delayMs,
    body:
      status >= 400
        ? { message: "Falha ao criar agendamento" }
        : {
            appointment: buildAppointment({
              id: "created-appointment",
              serviceName: serviceOption.label,
              startsAt: "2026-05-22T10:00:00",
              endsAt: "2026-05-22T10:35:00",
            }),
          },
  }).as(alias);
}

function stubUpdateAppointment({
  status = 200,
  delayMs = 0,
  alias = "updateAppointmentRequest",
}: StubMutationOptions = {}) {
  cy.intercept("PATCH", "**/appointments/appointment-1", {
    statusCode: status,
    delay: delayMs,
    body:
      status >= 400
        ? { message: "Falha ao atualizar agendamento" }
        : {
            appointment: buildAppointment({
              id: "appointment-1",
              serviceName: "Lavagem Express",
              startsAt: "2026-05-22T10:00:00",
              endsAt: "2026-05-22T10:35:00",
            }),
          },
  }).as(alias);
}

function stubUpdateAppointmentStatus({
  status = 200,
  delayMs = 0,
  alias = "updateAppointmentStatusRequest",
  onRequest,
}: StubMutationOptions = {}) {
  cy.intercept("PATCH", "**/appointments/*/status", (request) => {
    onRequest?.();

    request.reply({
      statusCode: status,
      delay: delayMs,
      body:
        status >= 400
          ? { message: "Falha ao atualizar status" }
          : {
              appointment: {
                id: "appointment-1",
                status: "DONE",
                updatedAt: "2026-05-22T10:00:00.000Z",
                doneAt: "2026-05-22T10:35:00.000Z",
                cancelledAt: null,
              },
            },
    });
  }).as(alias);
}

function openAppointmentForm() {
  cy.contains("button", /^Novo agendamento$/i).click();
  cy.get('[data-cy="appointment-form-sheet"]').should("be.visible");
}

function selectComboboxOption(inputName: "customerId" | "vehicleId", optionLabel: string) {
  cy.get(`input[name="${inputName}"]`).clear().type(optionLabel);
  cy.contains('[data-slot="combobox-item"]', optionLabel).should("be.visible").click();
}

function selectServiceOption(optionLabel: string) {
  cy.contains("label", /^Serviços/)
    .parent()
    .find("input")
    .click();
  cy.contains("[cmdk-item], [role='option']", optionLabel).should("be.visible").click();
}

function fillValidAppointmentForm() {
  selectComboboxOption("customerId", customerOption.label);
  cy.wait("@vehicleOptionsRequest");

  selectServiceOption(serviceOption.label);
  selectComboboxOption("vehicleId", vehicleOption.label);

  cy.get('[data-cy="appointment-form-sheet"]').within(() => {
    cy.get('input[type="time"]').first().clear().type("10:00");
    cy.get("textarea[name='description']").clear().type("Cliente solicitou lavagem detalhada.");
    cy.contains("label", /^Desconto/)
      .parent()
      .find("input")
      .clear()
      .type("1500");
  });
}

function visitAppointments() {
  cy.clock(currentDate.getTime(), ["Date"]);
  cy.stubLogin();
  cy.visit("/login");
  cy.get('input[name="email"]').type("joao@email.com");
  cy.get('input[name="password"]').type("supersenha");
  cy.contains("button", /^entrar$/i).click();
  cy.wait("@loginRequest");
  cy.url().should("include", "/home");
  cy.get("body").then(($body) => {
    if ($body.find('button[aria-label="Abrir menu lateral"]:visible').length) {
      cy.get('button[aria-label="Abrir menu lateral"]').click();
    }
  });
  cy.get('a[href="/appointments"]').filter(":visible").first().click();
  cy.url().should("include", "/appointments");
  cy.get("body").type("{esc}", { force: true });
  cy.contains("h1", "Agendamentos").should("be.visible");
}

function assertToastVisible(message: string) {
  cy.contains('[data-sonner-toast][data-visible="true"] [data-title]', message).should(
    "be.visible",
  );
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
    cy.contains("button", /^Novo agendamento$/i).should("be.visible");
    cy.contains("22/05/2026").should("be.visible");
    cy.contains("Visualização: Mês").should("be.visible");
    cy.contains("Status: Todos").should("be.visible");
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
    cy.get('[role="status"][aria-label="Carregando agenda do dia"]').should("be.visible");

    cy.wait("@appointmentsRequest");
    cy.contains("Carregando agendamentos...").should("not.exist");
    cy.contains("Lavagem Express").should("be.visible");
  });

  it("shows the empty state when the selected day has no appointments", () => {
    stubAppointments({ appointments: [] });
    visitAppointments();

    cy.wait("@appointmentsRequest");

    cy.get(".fc-event").should("not.exist");
    cy.contains("Nenhum agendamento neste dia.").should("be.visible");
    cy.contains("Agenda do dia").should("be.visible");
  });

  it("shows the error state and reloads appointments with the retry action", () => {
    stubAppointmentsSequence([
      { status: 500 },
      { status: 500 },
      { appointments: defaultAppointments },
    ]);
    visitAppointments();

    cy.wait("@appointmentsRequest");
    cy.wait("@appointmentsRequest");

    cy.contains("Não foi possível carregar os agendamentos.").should("be.visible");
    cy.contains("Não foi possível carregar a agenda.").should("be.visible");

    cy.contains("button", /^Tentar novamente$/i).click();
    cy.wait("@appointmentsRequest");

    cy.contains("Lavagem Express").should("be.visible");
    cy.contains("Não foi possível carregar os agendamentos.").should("not.exist");
  });

  it("sends the selected status filter in the appointments request", () => {
    const requestUrls: string[] = [];

    cy.intercept("GET", "**/appointments/calendar*", (request) => {
      requestUrls.push(request.url);

      request.reply({
        statusCode: 200,
        body: {
          appointments: defaultAppointments,
        },
      });
    }).as("appointmentsRequest");
    visitAppointments();

    cy.wait("@appointmentsRequest");
    cy.contains("button", "Status: Todos").click();
    cy.contains('[role="option"]', "Status: Concluído").click();

    cy.wait("@appointmentsRequest");
    cy.wrap(null).should(() => {
      expect(
        requestUrls.some((url) => queryParamIncludes(url, "status", "DONE")),
        "calendar request with status=DONE",
      ).to.equal(true);
    });
  });

  it("validates required fields before creating an appointment", () => {
    let createRequestSent = false;

    stubAppointments();
    stubAppointmentFormOptions();
    cy.intercept("POST", "**/appointments", (request) => {
      createRequestSent = true;
      request.reply({ statusCode: 201, body: {} });
    });
    visitAppointments();

    cy.wait("@appointmentsRequest");
    openAppointmentForm();
    cy.get('[data-cy="appointment-form-sheet"] form').should("have.attr", "novalidate");
    cy.contains("button", /^Salvar agendamento$/i).click();

    cy.contains("Selecione um cliente.").should("be.visible");
    cy.contains("Selecione pelo menos um serviço.").should("be.visible");
    cy.contains("Selecione um veículo.").should("be.visible");
    cy.then(() => {
      expect(createRequestSent).to.equal(false);
    });
  });

  it("creates an appointment and sends the normalized request body", () => {
    stubAppointments();
    stubAppointmentFormOptions();
    stubCreateAppointment();
    visitAppointments();

    cy.wait("@appointmentsRequest");
    openAppointmentForm();
    cy.wait("@customerOptionsRequest");
    cy.wait("@serviceOptionsRequest");
    fillValidAppointmentForm();
    cy.contains("button", /^Salvar agendamento$/i).click();

    cy.wait("@createAppointmentRequest").then(({ request }) => {
      const requestBody = request.body as AppointmentRequestBody;

      expect(requestBody.customerId).to.equal(customerOption.id);
      expect(requestBody.serviceIds).to.deep.equal([serviceOption.id]);
      expect(requestBody.vehicleId).to.equal(vehicleOption.id);
      expect(requestBody.startsAt).to.match(/^2026-05-22T10:00:00\.000Z$/);
      expect(requestBody.endsAt).to.equal(null);
      expect(requestBody.description).to.equal("Cliente solicitou lavagem detalhada.");
      expect(requestBody.discountValue).to.equal("15,00");
    });
    assertToastVisible("Agendamento criado com sucesso.");
    cy.get('[data-cy="appointment-form-sheet"]').should("not.exist");
  });

  it("keeps the form open and shows feedback when appointment creation fails", () => {
    stubAppointments();
    stubAppointmentFormOptions();
    stubCreateAppointment({ status: 500 });
    visitAppointments();

    cy.wait("@appointmentsRequest");
    openAppointmentForm();
    cy.wait("@customerOptionsRequest");
    cy.wait("@serviceOptionsRequest");
    fillValidAppointmentForm();
    cy.contains("button", /^Salvar agendamento$/i).click();
    cy.wait("@createAppointmentRequest");

    assertToastVisible("Falha ao carregar agendamento.");
    cy.get('[data-cy="appointment-form-sheet"]').should("be.visible");
    cy.contains("button", /^Salvar agendamento$/i).should("be.enabled");
  });

  it("edits an appointment from the day agenda and sends only changed fields", () => {
    stubAppointments();
    stubAppointmentFormOptions();
    stubUpdateAppointment();
    visitAppointments();

    cy.wait("@appointmentsRequest");
    cy.get('[data-cy="appointment-agenda-item-appointment-1"]')
      .scrollIntoView()
      .within(() => {
        cy.get('button[aria-label="Ações do agendamento"]').click();
      });
    cy.contains('[role="menuitem"]', "Editar agendamento").click();

    cy.get('[data-cy="appointment-form-sheet"]').should("be.visible");
    cy.contains("Editar agendamento").should("be.visible");
    cy.get("textarea[name='description']").clear().type("Observação atualizada pelo fluxo e2e.");
    cy.contains("button", /^Salvar alterações$/i).click();

    cy.wait("@updateAppointmentRequest").then(({ request }) => {
      const requestBody = request.body as Partial<AppointmentRequestBody>;

      expect(request.url).to.match(/\/appointments\/appointment-1$/);
      expect(requestBody).to.deep.equal({
        description: "Observação atualizada pelo fluxo e2e.",
      });
    });
    assertToastVisible("O agendamento foi atualizado com sucesso.");
    cy.get('[data-cy="appointment-form-sheet"]').should("not.exist");
  });

  it("updates an appointment status from the day agenda and refreshes the calendar data", () => {
    let statusUpdated = false;
    const updatedAppointments = defaultAppointments.map((appointment) =>
      appointment.id === "appointment-1"
        ? { ...appointment, status: "DONE" as const }
        : appointment,
    );

    cy.intercept("GET", "**/appointments/calendar*", (request) => {
      request.reply({
        statusCode: 200,
        body: {
          appointments: statusUpdated ? updatedAppointments : defaultAppointments,
        },
      });
    }).as("appointmentsRequest");
    stubUpdateAppointmentStatus({
      onRequest: () => {
        statusUpdated = true;
      },
    });
    visitAppointments();

    cy.wait("@appointmentsRequest");
    cy.get('[data-cy="appointment-agenda-item-appointment-1"]')
      .scrollIntoView()
      .within(() => {
        cy.get('button[aria-label="Ações do agendamento"]').click();
      });
    cy.contains('[role="menuitem"]', "Marcar como concluído").click();

    cy.wait("@updateAppointmentStatusRequest").then(({ request }) => {
      expect(request.url).to.match(/\/appointments\/appointment-1\/status$/);
      expect(request.body).to.deep.equal({ status: "DONE" });
    });
    cy.wait("@appointmentsRequest");

    assertToastVisible("Status do agendamento atualizado com sucesso.");
    cy.get('[data-cy="appointment-agenda-item-appointment-1"]').contains("Finalizado");
  });

  it("switches to daily view and keeps short-event time visible beside the title", () => {
    stubAppointments();
    visitAppointments();

    cy.wait("@appointmentsRequest");
    cy.contains("button", "Visualização: Mês").click();
    cy.contains('[role="option"]', "Visualização: Dia").click();

    cy.contains("Visualização: Dia").should("be.visible");
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

    cy.contains("Visualização: Mês").should("be.visible");
    cy.contains("Agenda do dia").scrollIntoView().should("be.visible");
    cy.window().then((window) => {
      const documentWidth = window.document.documentElement.scrollWidth;

      expect(documentWidth).to.be.at.most(window.innerWidth + 1);
    });
  });
});
