"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppointmentFormSheet } from "@/features/appointments/components/form-sheet/appointment-form-sheet";

export function AgendaNewAppointmentButton() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        className="h-11 w-full sm:w-auto sm:min-w-50"
        onClick={() => setSheetOpen(true)}
      >
        <Plus className="size-4" aria-hidden />
        Novo agendamento
      </Button>

      <AppointmentFormSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
