"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useState } from "react";
import EconomicActivityModal from "./EconomicActivityModal";

interface EconomicActivityActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function EconomicActivityActions({
  permissions,
}: EconomicActivityActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Actividad Económica
      </Button>
      <EconomicActivityModal
        title="Crear Actividad Económica"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
