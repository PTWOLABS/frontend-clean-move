import { ServicosList } from "@/features/service/components/servicos-list";

export default function ServicesPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Serviços</h2>
        <p className="text-sm text-muted-foreground">
          Lista de serviços obtidos da API externa com React Query.
        </p>
      </header>

      <ServicosList />
    </section>
  );
}
