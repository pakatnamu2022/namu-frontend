import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Settings,
  ClipboardCheck,
  Pencil,
  Download,
  Loader2,
  BookMarked,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { WorkOrderResource } from "../lib/workOrder.interface";
import { WORK_ORDER_STATUS } from "../lib/workOrder.constants";
import { errorToast, successToast } from "@/core/core.function";
import { downloadDeliveryPdf } from "../lib/workOrder.actions";

interface WorkOrderActionCellProps {
  row: WorkOrderResource;
  permissions: {
    canReceive: boolean;
    canManage: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  onInternalNote: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onManage: (id: number) => void;
  onInspect: (id: number) => void;
}

export function WorkOrderActionCell({
  row,
  permissions,
  onInternalNote,
  onDelete,
  onUpdate,
  onManage,
  onInspect,
}: WorkOrderActionCellProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { id, is_inspection_completed, status } = row;
  const isClosed = status?.description === WORK_ORDER_STATUS.CERRADO;
  const isOpen = status?.description === WORK_ORDER_STATUS.APERTURADO;

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadDeliveryPdf(id);
      successToast("PDF descargado exitosamente");
    } catch {
      errorToast("Error al descargar el PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {permissions.canReceive && !is_inspection_completed && !isClosed && (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onInspect(id)}
          tooltip="Recepción de Vehículo"
        >
          <ClipboardCheck className="size-5" />
        </Button>
      )}

      {permissions.canManage && (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          tooltip="Gestionar"
          onClick={() => onManage(id)}
        >
          <Settings className="size-5" />
        </Button>
      )}

      {permissions.canUpdate && isOpen && (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          tooltip="Editar"
          onClick={() => onUpdate(id)}
        >
          <Pencil className="size-5" />
        </Button>
      )}

      {permissions.canDelete && isOpen && (
        <DeleteButton onClick={() => onDelete(id)} />
      )}

      {isClosed && (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          tooltip={isDownloading ? "Generando PDF..." : "Descargar PDF"}
        >
          {isDownloading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Download className="size-5" />
          )}
        </Button>
      )}

      {!isClosed && (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          tooltip="Generar Nota Interna"
          onClick={() => onInternalNote(id)}
        >
          <BookMarked className="size-5" />
        </Button>
      )}
    </div>
  );
}
