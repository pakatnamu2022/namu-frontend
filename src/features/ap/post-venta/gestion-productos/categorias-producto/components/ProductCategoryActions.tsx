import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ProductCategoryModal from "./ProductCategoryModal";

interface ProductCategoryActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ProductCategoryActions({
  permissions,
}: ProductCategoryActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Categoría de Producto
      </Button>
      <ProductCategoryModal
        title="Crear Categoría de Producto"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
