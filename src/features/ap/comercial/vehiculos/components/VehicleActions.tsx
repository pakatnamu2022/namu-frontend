"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import VehicleModal from "./VehicleModal";

export default function VehicleActions() {
  const [open, setOpen] = useState(false);

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar Vehículo
      </Button>
      <VehicleModal
        title="Crear Vehículo"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
