import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { WAREHOUSE } from "../lib/warehouse.constants";

interface WarehouseActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function WarehouseActions({
  permissions,
}: WarehouseActionsProps) {
  const router = useRouter();
  const { ROUTE_ADD } = WAREHOUSE;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router.push(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Agregar Almacén
      </Button>
    </ActionsWrapper>
  );
}
