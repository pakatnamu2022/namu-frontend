import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ExportButtons from "@/shared/components/ExportButtons";
import { cn } from "@/lib/utils";
import { exportVehiclePurchaseOrder } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.actions";

interface Props {
  isFetching?: boolean;
  onRefresh: () => void;
  exportParams?: Record<string, any>;
  canExport?: boolean;
}

export default function PurchaseOrderWarehouseActions({
  onRefresh,
  isFetching,
  exportParams,
  canExport = true,
}: Props) {
  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={() => onRefresh()}>
        <RefreshCcw
          className={cn("size-4 mr-2", { "animate-spin": isFetching })}
        />
        Actualizar
      </Button>
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
    </ActionsWrapper>
  );
}
