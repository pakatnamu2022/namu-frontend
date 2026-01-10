import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { PRODUCT, PRODUCT_REPUESTOS } from "../lib/product.constants";

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
