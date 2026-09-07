import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw, Send, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OcsiInvoiceUpdateByVinSheet from "./OcsiInvoiceUpdateByVinSheet";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ExportButtons from "@/shared/components/ExportButtons";
import { VEHICLE_PURCHASE_ORDER } from "../lib/vehiclePurchaseOrder.constants";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import {
  dispatchAllVehiclePurchaseOrders,
  exportVehiclePurchaseOrder,
} from "../lib/vehiclePurchaseOrder.actions";
import { toast } from "sonner";

interface Props {
  isFetching?: boolean;
  onRefresh: () => void;
  exportParams?: Record<string, any>;
  canExport?: boolean;
  canImport?: boolean;
}

export default function VehiclePurchaseOrderActions({
  onRefresh,
  isFetching,
  exportParams,
  canExport = true,
  canImport = false,
}: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = VEHICLE_PURCHASE_ORDER;
  const [ocsiOpen, setOcsiOpen] = useState(false);

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
      {canImport && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOcsiOpen(true)}
          >
            <Upload className="size-4 mr-2" />
            Importar Fecha/Factura OCSI
          </Button>
          <OcsiInvoiceUpdateByVinSheet
            open={ocsiOpen}
            onClose={() => setOcsiOpen(false)}
            onSuccess={onRefresh}
          />
        </>
      )}
      {canExport && (
        <ExportButtons
          onExcelDownload={() =>
            exportVehiclePurchaseOrder({
              params: exportParams,
              format: "excel",
            })
          }
          onPdfDownload={() =>
            exportVehiclePurchaseOrder({
              params: exportParams,
              format: "pdf",
            })
          }
        />
      )}
      <Button size="sm" onClick={() => router(ROUTE_ADD!)}>
        <Plus className="size-4 mr-2" /> Agregar Orden de Compra
      </Button>
    </ActionsWrapper>
  );
}
