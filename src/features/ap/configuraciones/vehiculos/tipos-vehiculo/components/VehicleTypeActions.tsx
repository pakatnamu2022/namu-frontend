import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import VehicleTypeModal from "./VehicleTypeModal";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface VehicleTypeActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function VehicleTypeActions({
  permissions,
}: VehicleTypeActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Vehículo
      </Button>
      <VehicleTypeModal
        title="Crear Tipo de Vehículo"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
