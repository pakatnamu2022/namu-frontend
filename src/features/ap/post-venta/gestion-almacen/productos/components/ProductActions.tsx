import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";
import { PRODUCT, PRODUCT_REPUESTOS } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.constants.ts";

interface ProductActionsProps {
  permissions: {
    canCreate: boolean;
  };
  module: "ALMACEN" | "REPUESTOS";
}

export default function ProductActions({
  permissions,
  module,
}: ProductActionsProps) {
  if (!permissions.canCreate) {
    return null;
  }
  const { ROUTE_ADD } = module === "ALMACEN" ? PRODUCT : PRODUCT_REPUESTOS;

  return (
    <ActionsWrapper>
      <Link to={ROUTE_ADD!}>
        <Button size="sm" variant="outline" className="ml-auto">
          <Plus className="size-4 mr-2" /> Agregar Producto
        </Button>
      </Link>
    </ActionsWrapper>
  );
}
