import { expect, type Locator, type Page, test } from "@playwright/test";

type LayoutBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type AgendaLayoutSnapshot = {
  primary: LayoutBox;
  secondary: LayoutBox;
  gridTemplateColumns: string;
  bodyScrollLocked: boolean;
};

const mockedNow = "2026-06-21T12:00:00.000Z";

const viewportScenarios = [
  {
    name: "1279px permanece empilhado perto do limite xl",
    width: 1279,
    expectedLayout: "stacked",
  },
  {
    name: "1368px permanece empilhado com sidebar expandida",
    width: 1368,
    expectedLayout: "stacked",
  },
  {
    name: "1600px usa duas colunas em tela ampla",
    width: 1600,
    expectedLayout: "side-by-side",
  },
] as const;

test.describe("Safari/WebKit viewport regressions", () => {
  test.skip(({ browserName }) => browserName !== "webkit", "Cenario especifico de Safari/WebKit");

  for (const scenario of viewportScenarios) {
    test(`${scenario.name} ao abrir select`, async ({ page }) => {
      await openMockedAgenda(page, scenario.width);

      const before = await getAgendaLayoutSnapshot(page);
      expectAgendaLayout(before, scenario.expectedLayout);
      expect(before.bodyScrollLocked).toBe(false);

      await page.getByRole("combobox", { name: "Campo da busca" }).click();
      await expect(page.getByRole("option").first()).toBeVisible();

      const after = await getAgendaLayoutSnapshot(page);
      expectAgendaLayout(after, scenario.expectedLayout);
      expectAgendaLayoutToRemainStable(after, before);
      expect(after.bodyScrollLocked).toBe(true);
    });
  }

  test("dropdown de conta nao deve acionar scroll lock no body", async ({ page }) => {
    await openMockedAgenda(page, 1368);

    await page.getByRole("button", { name: /abrir menu da conta/i }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked", /.+/);
  });
});

async function openMockedAgenda(page: Page, width: number) {
  await mockCleanMoveApi(page);
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/agenda");

  await expect(page.getByRole("heading", { name: "Agenda" })).toBeVisible();
  await expect(page.getByTestId("agenda-primary-column")).toBeVisible();
  await expect(page.getByTestId("agenda-secondary-column")).toBeVisible();
}

async function mockCleanMoveApi(page: Page) {
  await page.route(
    (url) => url.pathname === "/auth/refresh",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          userId: "user-e2e",
          accessToken: "e2e-access-token",
        },
      });
    },
  );

  await page.route(
    (url) => url.pathname === "/user/me",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          user: {
            id: "user-e2e",
            establishmentId: "establishment-e2e",
            onboardingCompletedAt: mockedNow,
            name: "Clean Move Detail",
            email: "admin@cleanmove.test",
            role: "ADMIN",
            profileImageUrl: null,
            phone: null,
            address: null,
            socialAccounts: [],
            profileComplete: true,
            createdAt: mockedNow,
            updatedAt: mockedNow,
          },
        },
      });
    },
  );

  await page.route(
    (url) => url.pathname === "/dashboard/metrics/appointments",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          total: 3,
          byStatus: {
            scheduled: 2,
            done: 1,
            cancelled: 0,
          },
          rates: {
            completion: 33,
            cancellation: 0,
          },
        },
      });
    },
  );

  await page.route(
    (url) => url.pathname === "/appointments",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          totalItems: 1,
          appointments: [
            {
              id: "appointment-e2e",
              establishmentId: "establishment-e2e",
              customerId: "customer-e2e",
              customer: {
                fullName: "Cliente Safari",
                currentResourceStatus: "UNCHANGED",
              },
              vehicleId: "vehicle-e2e",
              vehicle: {
                plate: "SAF1A23",
                brand: "Honda",
                model: "Civic",
                color: "Prata",
                year: 2022,
                currentResourceStatus: "UNCHANGED",
              },
              services: [
                {
                  id: "service-e2e",
                  name: "Lavagem detalhada",
                  category: null,
                  durationInMinutes: 90,
                  priceInCents: 15000,
                  currentResourceStatus: "UNCHANGED",
                },
              ],
              startsAt: "2026-06-21T13:00:00.000Z",
              endsAt: "2026-06-21T14:30:00.000Z",
              description: null,
              discountInCents: null,
              status: "SCHEDULED",
              createdAt: mockedNow,
              updatedAt: mockedNow,
              doneAt: null,
              cancelledAt: null,
            },
          ],
        },
      });
    },
  );
}

async function getAgendaLayoutSnapshot(page: Page): Promise<AgendaLayoutSnapshot> {
  const primary = await getBox(page.getByTestId("agenda-primary-column"));
  const secondary = await getBox(page.getByTestId("agenda-secondary-column"));
  const gridTemplateColumns = await page
    .getByTestId("agenda-layout-grid")
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  const bodyScrollLocked = await page.locator("body").evaluate((body) => {
    return body.hasAttribute("data-scroll-locked");
  });

  return {
    primary,
    secondary,
    gridTemplateColumns,
    bodyScrollLocked,
  };
}

async function getBox(locator: Locator): Promise<LayoutBox> {
  const box = await locator.boundingBox();

  expect(box).not.toBeNull();

  return box as LayoutBox;
}

function expectAgendaLayout(
  snapshot: AgendaLayoutSnapshot,
  expectedLayout: (typeof viewportScenarios)[number]["expectedLayout"],
) {
  if (expectedLayout === "stacked") {
    expect(snapshot.secondary.x).toBeCloseTo(snapshot.primary.x, 0);
    expect(snapshot.secondary.y).toBeGreaterThan(snapshot.primary.y + snapshot.primary.height - 1);
    expect(snapshot.gridTemplateColumns.trim().split(/\s+/)).toHaveLength(1);
    return;
  }

  expect(snapshot.secondary.x).toBeGreaterThan(snapshot.primary.x + snapshot.primary.width - 1);
  expect(snapshot.secondary.y).toBeCloseTo(snapshot.primary.y, 0);
  expect(snapshot.gridTemplateColumns.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
}

function expectAgendaLayoutToRemainStable(
  after: AgendaLayoutSnapshot,
  before: AgendaLayoutSnapshot,
) {
  expect(after.primary.x).toBeCloseTo(before.primary.x, 0);
  expect(after.primary.y).toBeCloseTo(before.primary.y, 0);
  expect(after.primary.width).toBeCloseTo(before.primary.width, 0);
  expect(after.secondary.x).toBeCloseTo(before.secondary.x, 0);
  expect(after.secondary.y).toBeCloseTo(before.secondary.y, 0);
  expect(after.secondary.width).toBeCloseTo(before.secondary.width, 0);
}
