import { MetricsSections } from "@/features/dashboard/components/metrics-sessions";

export default async function Dashboard() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe os principais indicadores da operação.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsSections />
      </div>
    </section>
  );
}
