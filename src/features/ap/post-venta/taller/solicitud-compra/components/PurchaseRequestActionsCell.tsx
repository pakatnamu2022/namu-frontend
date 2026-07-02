import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BellRing,
  CheckCircle,
  Download,
  Eye,
  Loader2,
  Pencil,
  XCircle,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { PurchaseRequestResource } from "../lib/purchaseRequest.interface";
import { errorToast, successToast } from "@/core/core.function";
import { downloadPurchaseRequestPdf } from "../lib/purchaseRequest.actions";

interface ActionsCellProps {
  row: PurchaseRequestResource;
  permissions: {
    canNotify: boolean;
    canApprove: boolean;
    canReject: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetail?: (purchaseRequest: PurchaseRequestResource) => void;
  onApprove?: (id: number) => void;
  onCancel?: (id: number) => void;
  onNotifyManagers?: (id: number) => void;
}

export const PurchaseRequestActionsCell = ({
  row,
  permissions,
  onUpdate,
  onDelete,
  onViewDetail,
  onApprove,
  onCancel,
  onNotifyManagers,
}: ActionsCellProps) => {
  const { id, ap_order_quotation_id, status, approved } = row;
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const hasQuotation = ap_order_quotation_id !== null;
  const isLockedStatus = approved || status === "cancelled";
  const hideOptions = !hasQuotation && !isLockedStatus && status === "pending";
  const hideOptionsDelete = !isLockedStatus && status === "pending";

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadPurchaseRequestPdf(id);
      successToast("PDF descargado correctamente para la solicitud de compra");
    } catch {
      errorToast("Error al descargar el PDF");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {onViewDetail && (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          tooltip="Ver Detalle"
          onClick={() => onViewDetail(row)}
        >
          <Eye className="size-5" />
        </Button>
      )}

      <Button
        variant="outline"
        size="icon"
        className="size-7"
        tooltip="Descargar PDF"
        onClick={handleDownloadPdf}
        disabled={isDownloadingPdf}
      >
        {isDownloadingPdf ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-5" />
        )}
      </Button>

      {permissions.canNotify && hideOptions && onNotifyManagers && (
        <Button
          variant="outline"
          size="icon"
          className="size-7 text-blue-500 hover:text-blue-600"
          tooltip="Notificar a Jefatura"
          onClick={() => onNotifyManagers(id)}
        >
          <BellRing className="size-5" />
        </Button>
      )}

      {permissions.canApprove && hideOptions && onApprove && (
        <Button
          variant="outline"
          size="icon"
          className="size-7 text-green-600 hover:text-green-700"
          tooltip="Aprobar"
          onClick={() => onApprove(id)}
        >
          <CheckCircle className="size-5" />
        </Button>
      )}

      {permissions.canReject && hideOptions && onCancel && (
        <Button
          variant="outline"
          size="icon"
          className="size-7 text-red-500 hover:text-red-600"
          tooltip="Rechazar"
          onClick={() => onCancel(id)}
        >
          <XCircle className="size-5" />
        </Button>
      )}

      {permissions.canUpdate && hideOptions && (
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

      {permissions.canDelete && hideOptionsDelete && (
        <DeleteButton onClick={() => onDelete(id)} />
      )}
    </div>
  );
};
