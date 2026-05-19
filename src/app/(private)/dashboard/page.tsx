import { MetricsSections } from "@/features/dashboard/components/metrics-sessions";

export default async function Dashboard() {
  return (
    <section className="space-y-6">
      <MetricsSections />
    </section>
  );
}
