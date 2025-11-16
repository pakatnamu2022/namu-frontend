import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from 'react-router-dom'
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface ProductActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ProductActions({ permissions }: ProductActionsProps) {
  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Link to="./productos/agregar">
        <Button size="sm" variant="outline" className="ml-auto">
          <Plus className="size-4 mr-2" /> Agregar Producto
        </Button>
      </Link>
    </ActionsWrapper>
  );
}
