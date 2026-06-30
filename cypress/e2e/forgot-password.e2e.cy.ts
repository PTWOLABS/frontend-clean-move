describe("Forgot password flow", () => {
  beforeEach(() => {
    cy.visit("/forgot-password");
  });

  it("should display the forgot password page with form and links", () => {
    cy.contains("h1", /esqueceu sua senha/i).should("be.visible");
    cy.contains(/informe seu e-mail e enviaremos um link/i).should("be.visible");

    cy.get('input[name="email"]').should("be.visible");
    cy.contains("button", /enviar link de recuperação/i).should("be.visible");
    cy.contains("a", /voltar ao login/i).should("have.attr", "href", "/login");
  });

  it("should display a validation error when submitting an empty form", () => {
    cy.contains("button", /enviar link de recuperação/i).click();
    cy.contains(/informe um e-mail válido/i).should("be.visible");
  });

  it("should show success state after a successful request", () => {
    cy.intercept("POST", "**/auth/password-reset/request", {
      statusCode: 200,
      body: {
        message: "If an account exists for this email, we will send a password reset link.",
      },
    }).as("passwordResetRequest");

    cy.get('input[name="email"]').type("user@example.com");
    cy.contains("button", /enviar link de recuperação/i).click();

    cy.wait("@passwordResetRequest").its("request.body").should("deep.equal", {
      email: "user@example.com",
    });

    cy.contains("h1", /verifique seu e-mail/i).should("be.visible");
    cy.contains("h1", /esqueceu sua senha/i).should("not.exist");
    cy.contains(/se existir uma conta com este e-mail/i).should("be.visible");
    cy.contains("a", /voltar ao login/i).should("be.visible");
  });
});

describe("Reset password flow", () => {
  it("should display invalid token state when token is missing", () => {
    cy.visit("/reset-password");

    cy.contains(/link de recuperação inválido/i).should("be.visible");
    cy.contains("a", /solicitar novo link/i).should("have.attr", "href", "/forgot-password");
  });

  it("should redirect to login after a successful password reset", () => {
    cy.intercept("POST", "**/auth/password-reset/confirm", {
      statusCode: 200,
      body: { message: "Password reset successfully." },
    }).as("passwordResetConfirm");

    cy.visit("/reset-password?token=valid-reset-token");

    cy.contains("h1", /crie uma nova senha/i).should("be.visible");
    cy.get('input[name="newPassword"]').type("novaSenhaForte");
    cy.get('input[name="confirmPassword"]').type("novaSenhaForte");
    cy.contains("button", /redefinir senha/i).click();

    cy.wait("@passwordResetConfirm").its("request.body").should("deep.equal", {
      token: "valid-reset-token",
      newPassword: "novaSenhaForte",
    });

    cy.contains("Senha redefinida com sucesso.").should("be.visible");
    cy.url().should("include", "/login");
  });
});
