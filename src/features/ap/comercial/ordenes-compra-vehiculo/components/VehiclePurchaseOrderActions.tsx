import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { VEHICLE_PURCHASE_ORDER } from "../lib/vehiclePurchaseOrder.constants";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { dispatchAllVehiclePurchaseOrders } from "../lib/vehiclePurchaseOrder.actions";
import { toast } from "sonner";

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

  const dispatchAllMutation = useMutation({
    mutationFn: dispatchAllVehiclePurchaseOrders,
    onSuccess: () => {
      toast.success("Migración iniciada correctamente");
      onRefresh();
    },
    onError: () => {
      toast.error("Error al iniciar la migración");
    },
  });

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
        onClick={() => dispatchAllMutation.mutate()}
        disabled={dispatchAllMutation.isPending}
      >
        <Send
          className={cn("size-4 mr-2", {
            "animate-pulse": dispatchAllMutation.isPending,
          })}
        />
        Migrar Todo
      </Button>
      <Button size="sm" onClick={() => router(ROUTE_ADD!)}>
        <Plus className="size-4 mr-2" /> Agregar Orden de Compra
      </Button>
    </ActionsWrapper>
  );
}
