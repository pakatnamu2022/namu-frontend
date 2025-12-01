import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ReasonsAdjustmentModal from "./ReasonsAdjustmentModel";

interface ReasonsAdjustmentActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ReasonsAdjustmentActions({
  permissions,
}: ReasonsAdjustmentActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Motivo de Ajuste
      </Button>
      <ReasonsAdjustmentModal
        title="Crear Motivo de Ajuste"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
