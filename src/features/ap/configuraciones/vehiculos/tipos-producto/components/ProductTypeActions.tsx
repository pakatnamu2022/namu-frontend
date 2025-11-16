import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ProductTypeModal from "./ProductTypeModal";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";

interface ProductTypeActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ProductTypeActions({
  permissions,
}: ProductTypeActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Producto
      </Button>
      <ProductTypeModal
        title="Crear Tipo de Producto"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
