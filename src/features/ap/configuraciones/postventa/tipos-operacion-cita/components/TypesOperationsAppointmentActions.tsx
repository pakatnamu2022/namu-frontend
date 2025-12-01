import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { useState } from "react";
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";
import TypesOperationsAppointmentModal from "./TypesOperationsAppointmentModal.tsx";

interface TypesOperationsAppointmentActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function TypesOperationsAppointmentActions({
  permissions,
}: TypesOperationsAppointmentActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Operación
      </Button>
      <TypesOperationsAppointmentModal
        title="Crear Tipo de Operación"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
