import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import EngineTypesModal from "./EngineTypesModal";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface EngineTypesActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function EngineTypesActions({
  permissions,
}: EngineTypesActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Motor
      </Button>
      <EngineTypesModal
        title="Crear Tipo de Motor"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
