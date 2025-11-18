import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface PurchaseOrderProductsActionsProps {
  permissions: {
    canCreate: boolean;
  };
  routeAdd?: string;
}

export default function PurchaseOrderProductsActions({
  permissions,
  routeAdd = "/ap/post-venta/gestion-de-compras/orden-compra-producto/agregar",
}: PurchaseOrderProductsActionsProps) {
  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Link to={routeAdd}>
        <Button size="sm" variant="outline" className="ml-auto">
          <Plus className="size-4 mr-2" /> Agregar Orden de Compra
        </Button>
      </Link>
    </ActionsWrapper>
  );
}
