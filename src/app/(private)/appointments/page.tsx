import type { Metadata } from "next";

import { AppointmentsPage } from "@/features/appointments/components/appointments-page";

export const metadata: Metadata = {
  title: "Calendário",
  description: "Visualize e organize os agendamentos da sua operação por data e horário.",
};

export default function AppointmentsRoute() {
  return <AppointmentsPage />;
}
