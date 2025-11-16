"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CategoryChecklistModal from "./CategoryChecklistModal";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";

interface CategoryChecklistActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function CategoryChecklistActions({
  permissions,
}: CategoryChecklistActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Checklist
      </Button>
      <CategoryChecklistModal
        title="Crear Categoria de Checklist"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
