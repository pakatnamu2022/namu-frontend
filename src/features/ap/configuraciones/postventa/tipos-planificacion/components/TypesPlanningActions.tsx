import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { useState } from "react";
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";
import TypesPlanningModal from "./TypesPlanningModal.tsx";

interface TypesPlanningActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function TypesPlanningActions({
  permissions,
}: TypesPlanningActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Planificación
      </Button>
      <TypesPlanningModal
        title="Crear Tipo de Planificación"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
