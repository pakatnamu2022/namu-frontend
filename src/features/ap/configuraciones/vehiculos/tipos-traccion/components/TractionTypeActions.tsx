import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import TractionTypeModal from "./TractionTypeModal";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface TractionTypeActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function TractionTypeActions({
  permissions,
}: TractionTypeActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Tracción
      </Button>
      <TractionTypeModal
        title="Crear Tipo de Tracción"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
