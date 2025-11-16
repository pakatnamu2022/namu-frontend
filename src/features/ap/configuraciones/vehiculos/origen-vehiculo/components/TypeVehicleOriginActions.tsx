import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import TypeVehicleOriginModal from "./typeVehicleOriginModal";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";

interface TypeVehicleOriginActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function TypeVehicleOriginActions({
  permissions,
}: TypeVehicleOriginActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Origen de Vehículo
      </Button>
      <TypeVehicleOriginModal
        title="Crear Origen de Vehículo"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
