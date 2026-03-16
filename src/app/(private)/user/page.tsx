import { UserSummary } from "@/features/user/components/user-summary";

export default function UserPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Usuário</h2>
        <p className="text-sm text-muted-foreground">
          Domínio de usuário integrado com a API externa via React Query.
        </p>
      </header>

      <UserSummary />
    </section>
  );
}

