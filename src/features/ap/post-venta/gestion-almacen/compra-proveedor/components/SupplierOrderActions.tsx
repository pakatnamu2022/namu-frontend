import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";

interface SupplierOrderActionsProps {
  permissions: {
    canCreate: boolean;
  };
  routeAdd?: string;
}

export default function SupplierOrderActions({
  permissions,
  routeAdd = "",
}: SupplierOrderActionsProps) {
  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Link to={routeAdd}>
        <Button size="sm" variant="outline" className="ml-auto">
          <Plus className="size-4 mr-2" /> Agregar Pedido a Proveedor
        </Button>
      </Link>
    </ActionsWrapper>
  );
}
