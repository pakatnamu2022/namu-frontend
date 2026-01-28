import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface PurchaseRequestActionsProps {
  permissions: {
    canCreate: boolean;
  };
  onAdd: () => void;
}

export default function PurchaseRequestActions({
  permissions,
  onAdd,
}: PurchaseRequestActionsProps) {
  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" className="ml-auto" onClick={onAdd}>
        <Plus className="size-4 mr-2" /> Agregar Solicitud
      </Button>
    </ActionsWrapper>
  );
}
