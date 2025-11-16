"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import UnitMeasurementModal from "./UnitMeasurementModal";

interface UnitMeasurementActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function UnitMeasurementActions({
  permissions,
}: UnitMeasurementActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Unidad de Medida
      </Button>
      <UnitMeasurementModal
        title="Crear Unidad de Medida"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
