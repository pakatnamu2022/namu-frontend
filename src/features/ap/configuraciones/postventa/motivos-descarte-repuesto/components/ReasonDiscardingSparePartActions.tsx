import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { useState } from "react";
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";
import ReasonDiscardingSparePartModal from "./ReasonDiscardingSparePartModel.tsx";

interface ReasonDiscardingSparePartActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ReasonDiscardingSparePartActions({
  permissions,
}: ReasonDiscardingSparePartActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Motivo de Descarte
      </Button>
      <ReasonDiscardingSparePartModal
        title="Crear Motivo de Descarte"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
