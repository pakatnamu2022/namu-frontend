import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";
import ExportButtons from "@/shared/components/ExportButtons.tsx";
import {
  PRODUCT,
  PRODUCT_REPUESTOS,
} from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.constants.ts";
import { exportProduct } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.actions.ts";

interface ProductActionsProps {
  permissions: {
    canCreate: boolean;
  };
  module: "ALMACEN" | "REPUESTOS";
  search?: string;
}

export default function ProductActions({
  permissions,
  module,
  search,
}: ProductActionsProps) {
  const { ROUTE_ADD } = module === "ALMACEN" ? PRODUCT : PRODUCT_REPUESTOS;

  return (
    <ActionsWrapper>
      <ExportButtons
        onExcelDownload={() =>
          exportProduct({ params: search ? { search } : undefined })
        }
      />
      {permissions.canCreate && (
        <Link to={ROUTE_ADD!}>
          <Button size="sm" variant="outline" className="ml-auto">
            <Plus className="size-4 mr-2" /> Agregar Producto
          </Button>
        </Link>
      )}
    </ActionsWrapper>
  );
}
