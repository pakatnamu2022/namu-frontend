"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useState } from "react";
import VoucherTypesModal from "./VoucherTypesModal";

interface VoucherTypesActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function VoucherTypesActions({
  permissions,
}: VoucherTypesActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Comprobante
      </Button>
      <VoucherTypesModal
        title="Crear Tipo de Comprobante"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
