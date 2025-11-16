import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import FuelTypeModal from "./FuelTypeModal";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";

interface FuelTypeActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function FuelTypeActions({ permissions }: FuelTypeActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Combustible
      </Button>
      <FuelTypeModal
        title="Crear Tipo de Combustible"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
