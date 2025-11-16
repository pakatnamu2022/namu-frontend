"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import VehicleCategoryModal from "./VehicleCategoryModal";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function VehicleCategoryActions({ permissions }: Props) {
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
        <Plus className="size-4 mr-2" /> Agregar Categoria
      </Button>
      <VehicleCategoryModal
        title="Crear Categoria de Vehículo"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
