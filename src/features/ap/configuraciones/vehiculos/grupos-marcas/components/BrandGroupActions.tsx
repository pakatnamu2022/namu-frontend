"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import BrandGroupModal from "./BrandGroupModal";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface BrandGroupActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function BrandGroupActions({
  permissions,
}: BrandGroupActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Grupo de Marcas
      </Button>
      <BrandGroupModal
        title="Crear Grupo de Marca"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
