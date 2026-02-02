import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";

interface ProductActionsProps {
  permissions: {
    canCreate: boolean;
  };
  route: string;
}

export default function ProductActions({
  permissions,
  route,
}: ProductActionsProps) {
  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Link to={route!}>
        <Button size="sm" variant="outline" className="ml-auto">
          <Plus className="size-4 mr-2" /> Agregar Producto
        </Button>
      </Link>
    </ActionsWrapper>
  );
}
