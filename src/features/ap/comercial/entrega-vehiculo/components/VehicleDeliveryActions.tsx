"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileClock, FileOutput, Plus, RefreshCcw, Send } from "lucide-react";
import { Link } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ExportButtons from "@/shared/components/ExportButtons";
import {
  ROUTE_GUIA_SALIDA,
  VEHICLE_DELIVERY,
} from "../lib/vehicleDelivery.constants";
import { useMutation } from "@tanstack/react-query";
import {
  dispatchAllShippingGuides,
  exportVehicleDelivery,
} from "../lib/vehicleDelivery.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import HistoricalShippingGuideDialog from "@/features/ap/shipping_guides/components/HistoricalShippingGuideDialog";

interface Props {
  permissions: {
    canCreate: boolean;
    canMigrate: boolean;
    canManage: boolean;
  };
  isFetching?: boolean;
  onRefresh: () => void;
  filters?: Record<string, any>;
}

export default function VehicleDeliveryActions({
  permissions,
  isFetching,
  onRefresh,
  filters,
}: Props) {
  const { ROUTE_ADD } = VEHICLE_DELIVERY;

  const { canCreate, canMigrate, canManage } = permissions;

  const [historicalOpen, setHistoricalOpen] = useState(false);

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
      <Button size="sm" variant="outline" onClick={() => onRefresh()}>
        <RefreshCcw
          className={cn("size-4 mr-2", { "animate-spin": isFetching })}
        />
        Actualizar
      </Button>
      {canMigrate && (
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
      )}
      <ExportButtons
        onExcelDownload={() => exportVehicleDelivery("excel", filters)}
        onPdfDownload={() => exportVehicleDelivery("pdf", filters)}
      />
      {canManage && (
        <Link to={ROUTE_GUIA_SALIDA}>
          <Button size="sm" variant="outline" className="ml-auto">
            <FileOutput className="size-4 mr-2" /> Guía de Salida
          </Button>
        </Link>
      )}
      {canManage && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setHistoricalOpen(true)}
        >
          <FileClock className="size-4 mr-2" /> Regularización Histórica
        </Button>
      )}
      {canCreate && (
        <Link to={ROUTE_ADD}>
          <Button size="sm">
            <Plus className="size-4 mr-2" /> Programar Entrega
          </Button>
        </Link>
      )}
      <HistoricalShippingGuideDialog
        open={historicalOpen}
        onOpenChange={setHistoricalOpen}
      />
    </ActionsWrapper>
  );
}
