import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import VehicleColorModal from "./VehicleColorModal";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface VehicleColorActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function VehicleColorActions({
  permissions,
}: VehicleColorActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Color de Vehículo
      </Button>
      <VehicleColorModal
        title="Crear Color de Vehículo"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
