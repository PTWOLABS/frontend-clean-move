import { expect, type Locator, type Page, test } from "@playwright/test";

const mockedNow = "2026-06-21T12:00:00.000Z";

test.describe("Select inside dismissable overlays", () => {
  test.beforeEach(async ({ page }) => {
    await mockCleanMoveApi(page);
  });

  test("mantem o popover de filtros da agenda aberto ao fechar o select de status", async ({
    page,
  }) => {
    await page.goto("/agenda");

    await expect(page.getByRole("heading", { name: "Agenda" })).toBeVisible();
    await page.getByRole("button", { name: /filtros/i }).click();

    const filtersPopover = page
      .locator("[data-radix-popper-content-wrapper]")
      .filter({ hasText: /filtros avan.ados/i });

    await expect(filtersPopover).toBeVisible();

    await filtersPopover.getByRole("combobox", { name: "Status" }).click();
    await expect(page.getByRole("option", { name: /todos os status/i })).toBeVisible();

    await clickLocatorCenter(page, filtersPopover.getByText(/filtros avan.ados/i));

    await expect(page.getByRole("option", { name: /todos os status/i })).toBeHidden();
    await expect(filtersPopover).toBeVisible();
  });

  test("mantem o sheet de servico aberto ao fechar o select de categorias", async ({ page }) => {
    await page.goto("/services");

    await page.getByRole("button", { name: /adicionar servi.o/i }).click();

    const serviceSheet = page.getByRole("dialog", { name: /novo servi.o/i });
    await expect(serviceSheet).toBeVisible();

    const categorySelect = serviceSheet.getByRole("combobox", { name: "Categoria" });
    const serviceNameInput = page.getByPlaceholder(/lavagem premium/i);

    await categorySelect.click();
    await expect(page.getByRole("option", { name: "Polimento" })).toBeVisible();

    await clickLocatorCenter(page, serviceNameInput);

    await expect(page.getByRole("option", { name: "Polimento" })).toBeHidden();
    await expect(serviceSheet).toBeVisible();

    const categorySelectBox = await getLocatorBox(categorySelect);
    await categorySelect.click();
    await expect(page.getByRole("option", { name: "Polimento" })).toBeVisible();

    await clickBoxCenter(page, categorySelectBox);

    await expect(page.getByRole("option", { name: "Polimento" })).toBeHidden();
    await expect(serviceSheet).toBeVisible();
  });
});

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
                fullName: "Cliente Overlay",
                currentResourceStatus: "UNCHANGED",
              },
              vehicleId: "vehicle-e2e",
              vehicle: {
                plate: "E2E1A23",
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

  await page.route(
    (url) => url.pathname === "/services/establishment-e2e",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          totalItems: 1,
          services: [
            {
              id: "service-e2e",
              establishmentId: "establishment-e2e",
              name: "Lavagem simples",
              description: "Servico base para o catalogo.",
              category: {
                id: "category-wash",
                name: "Lavagem",
              },
              estimatedDuration: {
                minInMinutes: 30,
                maxInMinutes: 60,
              },
              priceSpecification: {
                type: "FIXED",
                fixedPriceInCents: 5000,
              },
              isActive: true,
              createdAt: mockedNow,
              updatedAt: mockedNow,
            },
          ],
        },
      });
    },
  );

  await page.route(
    (url) => url.pathname === "/service-categories/options",
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          categories: [
            { id: "category-wash", label: "Lavagem" },
            { id: "category-polish", label: "Polimento" },
          ],
        },
      });
    },
  );
}

async function clickLocatorCenter(page: Page, locator: Locator) {
  const box = await getLocatorBox(locator);

  await clickBoxCenter(page, box);
}

async function getLocatorBox(locator: Locator) {
  const box = await locator.boundingBox();

  expect(box).not.toBeNull();

  return box!;
}

async function clickBoxCenter(
  page: Page,
  box: NonNullable<Awaited<ReturnType<Locator["boundingBox"]>>>,
) {
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}
