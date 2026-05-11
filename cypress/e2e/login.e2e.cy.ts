describe("Login flow", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should display the login page with form, links and main buttons", () => {
    cy.contains("h1", "Bem-vindo de volta").should("be.visible");
    cy.contains("Acesse sua conta para gerenciar seu negócio com eficiência.").should("be.visible");

    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");

    cy.contains("button", /^entrar$/i).should("be.visible");
    cy.get('[data-testid="google-signin-slot"]').should("be.visible");

    cy.contains("a", /esqueci minha senha/i).should("have.attr", "href", "/recuperar-senha");
    cy.contains("a", /cadastrar-se/i).should("have.attr", "href", "/register");
  });

  it("should toggle the password visibility between password and text", () => {
    cy.get('input[name="password"]').should("have.attr", "type", "password");

    cy.get('button[aria-label="Exibir senha"]').click();
    cy.get('input[name="password"]').should("have.attr", "type", "text");

    cy.get('button[aria-label="Ocultar senha"]').click();
    cy.get('input[name="password"]').should("have.attr", "type", "password");
  });

  it("should toggle the remember-me checkbox starting checked", () => {
    cy.get('input[name="remember"]').should("be.checked");
    cy.contains("label", /lembrar-me/i).click();
    cy.get('input[name="remember"]').should("not.be.checked");
  });

  it("should display a validation error when submitting an empty form", () => {
    cy.contains("button", /^entrar$/i).click();
    cy.contains(/informe um e-mail válido/i).should("be.visible");
  });

  it("should redirect to /home after a successful login", () => {
    cy.stubLogin();

    cy.get('input[name="email"]').type("joao@email.com");
    cy.get('input[name="password"]').type("supersenha");
    cy.contains("button", /^entrar$/i).click();

    cy.wait("@loginRequest").its("request.body").should("deep.equal", {
      email: "joao@email.com",
      password: "supersenha",
    });

    cy.url().should("include", "/home");
  });

  it("should show an invalid credentials toast when the api responds with 400", () => {
    cy.stubLogin({
      status: 400,
      body: { message: "Credenciais inválidas" },
    });

    cy.get('input[name="email"]').type("joao@email.com");
    cy.get('input[name="password"]').type("senha-errada");
    cy.contains("button", /^entrar$/i).click();

    cy.wait("@loginRequest");
    cy.contains("Credenciais inválidas").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("should show a generic error toast when the api responds with 500", () => {
    cy.stubLogin({
      status: 500,
      body: { message: "boom" },
    });

    cy.get('input[name="email"]').type("joao@email.com");
    cy.get('input[name="password"]').type("supersenha");
    cy.contains("button", /^entrar$/i).click();

    cy.wait("@loginRequest");
    cy.contains("Não foi possível fazer login. Tente novamente mais tarde").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("should navigate to the register page from the link", () => {
    cy.contains("a", /cadastrar-se/i).click();
    cy.url().should("include", "/register");
    cy.contains("h1", /crie sua conta/i).should("be.visible");
  });

  it("should navigate to the forgot password route from the link", () => {
    cy.contains("a", /esqueci minha senha/i).click();
    cy.url().should("include", "/recuperar-senha");
  });
});
