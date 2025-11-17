import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { VEHICLE_PURCHASE_ORDER } from "../lib/vehiclePurchaseOrder.constants";
import { cn } from "@/lib/utils";

interface Props {
  isFetching?: boolean;
  onRefresh: () => void;
}

export default function VehiclePurchaseOrderActions({
  onRefresh,
  isFetching,
}: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = VEHICLE_PURCHASE_ORDER;

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={() => onRefresh()}>
        <RefreshCcw
          className={cn("size-4 mr-2", { "animate-spin": isFetching })}
        />
        Actualizar
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => router(`/ap/comercial/${ROUTE_ADD}`)}
      >
        <Plus className="size-4 mr-2" /> Agregar Orden de Compra
      </Button>
    </ActionsWrapper>
  );
}
