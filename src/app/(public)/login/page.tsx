import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Login</h2>
        <p className="text-sm text-muted-foreground">
          Autenticação de exemplo usando React Hook Form, Zod e React Query.
        </p>
      </header>

      <LoginForm />
    </section>
  );
}

