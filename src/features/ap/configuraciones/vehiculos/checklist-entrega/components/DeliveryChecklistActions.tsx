import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import DeliveryChecklistModal from "./DeliveryChecklistModal";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";

interface DeliveryChecklistActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function DeliveryChecklistActions({
  permissions,
}: DeliveryChecklistActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Items de entrega
      </Button>
      <DeliveryChecklistModal
        title="Crear Items de entrega"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
