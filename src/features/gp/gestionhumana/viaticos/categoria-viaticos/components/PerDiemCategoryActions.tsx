"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import PerDiemCategoryModal from "./PerDiemCategoryModal";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function PerDiemCategoryActions({ permissions }: Props) {
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
      <PerDiemCategoryModal
        title="Crear Categoria de Viático"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
