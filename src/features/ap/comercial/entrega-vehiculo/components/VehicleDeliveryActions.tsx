"use client";

import { Button } from "@/components/ui/button";
import { Plus, Send } from "lucide-react";
import { Link } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { VEHICLE_DELIVERY } from "../lib/vehicleDelivery.constants";
import { useMutation } from "@tanstack/react-query";
import { dispatchAllShippingGuides } from "../lib/vehicleDelivery.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function VehicleDeliveryActions({ permissions }: Props) {
  const { ROUTE_ADD } = VEHICLE_DELIVERY;

  const dispatchAllMutation = useMutation({
    mutationFn: dispatchAllShippingGuides,
    onSuccess: () => {
      toast.success("Migración iniciada correctamente");
    },
    onError: () => {
      toast.error("Error al iniciar la migración");
    },
  });

  return (
    <ActionsWrapper>
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
      {permissions.canCreate && (
        <Link to={ROUTE_ADD}>
          <Button size="sm" className="ml-auto">
            <Plus className="size-4 mr-2" /> Programar Entrega
          </Button>
        </Link>
      )}
    </ActionsWrapper>
  );
}
