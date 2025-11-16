"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { useState } from "react";
import TaxClassTypesModal from "./TaxClassTypesModal";

interface TaxClassTypesActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function TaxClassTypesActions({
  permissions,
}: TaxClassTypesActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo Clase Impuesto
      </Button>
      <TaxClassTypesModal
        title="Crear Tipo Clase Impuesto"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
