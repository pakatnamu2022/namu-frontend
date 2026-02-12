"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import EquipmentTypeModal from "./EquipmentTypeModal";
import { useState } from "react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

export default function EquipmentTypeActions() {
  const [open, setOpen] = useState(false);

  return (
    <ActionsWrapper>
      <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar Tipo de Equipo
      </Button>
      <EquipmentTypeModal
        title="Crear Tipo de Equipo"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
