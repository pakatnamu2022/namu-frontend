"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AccountantDistrictAssignmentModal from "./AccountantDistrictAssignmentModal";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { ViewsResponseMenuChild } from "@/features/views/lib/views.interface";

interface Props {
  currentView: ViewsResponseMenuChild | null;
  permissions: {
    canCreate: boolean;
  };
}

export default function AccountantDistrictAssignmentActions({
  permissions,
  currentView,
}: Props) {
  const [open, setOpen] = useState(false);

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar Asignación
      </Button>
      <AccountantDistrictAssignmentModal
        title="Crear Asignación de Asistente"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
        currentView={currentView}
      />
    </ActionsWrapper>
  );
}
