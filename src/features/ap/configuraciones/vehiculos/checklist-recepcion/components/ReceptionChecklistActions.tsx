import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ReceptionChecklistModal from "./ReceptionChecklistModal";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface ReceptionChecklistActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ReceptionChecklistActions({
  permissions,
}: ReceptionChecklistActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Items de recepción
      </Button>
      <ReceptionChecklistModal
        title="Crear Items de recepción"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
