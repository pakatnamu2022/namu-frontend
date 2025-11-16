"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import RoleModal from "@/features/gp/gestionsistema/roles/components/RoleModal";
import { useState } from "react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

export default function RoleActions() {
  const [open, setOpen] = useState(false);

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar Rol
      </Button>
      <RoleModal
        title="Crear Rol"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
