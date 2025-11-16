import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import SupplierOrderTypeModal from "./SupplierOrderTypeModal";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";

interface SupplierOrderTypeActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function SupplierOrderTypeActions({
  permissions,
}: SupplierOrderTypeActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Pedido Proveedor
      </Button>
      <SupplierOrderTypeModal
        title="Crear Tipo de Pedido Proveedor"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
