import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { VEHICLE_STATUS } from "../lib/vehicleStatus.constants";

interface VehicleStatusActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function VehicleStatusActions({
  permissions,
}: VehicleStatusActionsProps) {
  const router = useRouter();
  const { ROUTE_ADD } = VEHICLE_STATUS;

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
        <Plus className="size-4 mr-2" /> Agregar Estado de Vehículo
      </Button>
    </ActionsWrapper>
  );
}
