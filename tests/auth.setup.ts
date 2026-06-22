import { test as setup, expect } from "@playwright/test";
import path from "node:path";

const authFile = path.join(process.cwd(), "playwright/.auth/user.json");

setup("login do usuário de teste", async ({ page }) => {
  console.log("E2E_EMAIL carregado?", Boolean(process.env.E2E_EMAIL));
  console.log("E2E_PASSWORD carregado?", Boolean(process.env.E2E_PASSWORD));

  await page.goto("/login");

  await page.locator('input[type="email"]').fill(process.env.E2E_EMAIL!);
  await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD!);

  // Confirma que os campos realmente receberam valores.
  console.log("E-mail preenchido:", await page.locator('input[type="email"]').inputValue());
  console.log(
    "Senha preenchida?",
    (await page.locator('input[type="password"]').inputValue()).length > 0,
  );

  // Exibe erros de console da aplicação.
  page.on("console", (message) => {
    if (message.type() === "error") {
      console.log("BROWSER CONSOLE ERROR:", message.text());
    }
  });

  // Exibe respostas com erro da API.
  page.on("response", async (response) => {
    if (response.status() >= 400) {
      console.log(
        `HTTP ERROR: ${response.status()} ${response.request().method()} ${response.url()}`,
      );
    }
  });

  await page
    .getByRole("button", {
      name: /entrar|acessar|fazer login/i,
    })
    .click();

  // Dá tempo para toast, erro de formulário ou request aparecer.
  await page.waitForTimeout(1500);

  console.log("URL após clicar:", page.url());

  // Salva uma imagem exatamente no estado em que falhou.
  await page.screenshot({
    path: "test-results/login-debug.png",
    fullPage: true,
  });

  // Tenta capturar mensagens comuns de erro da sua tela.
  const bodyText = await page.locator("body").innerText();
  console.log("Texto da página após login:", bodyText);

  await expect(page).not.toHaveURL(/\/login/, {
    timeout: 10_000,
  });

  await page.context().storageState({
    path: authFile,
    indexedDB: true,
  });
});
