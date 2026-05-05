"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ModelsVnModal from "./ModelsVnModal";
import { useState } from "react";

interface ModelsVnActionsProps {
  isCommercial: number;
  permissions: {
    canCreate: boolean;
  };
}

export default function ModelsVnPvActions({
  permissions,
}: ModelsVnActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Modelo VN
      </Button>
      <ModelsVnModal
        title={"Crear Modelo VN"}
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
