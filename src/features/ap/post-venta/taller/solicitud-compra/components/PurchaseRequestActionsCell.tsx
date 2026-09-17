import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BellRing,
  CheckCircle,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Loader2,
  Pencil,
  XCircle,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { PurchaseRequestResource } from "../lib/purchaseRequest.interface";
import { errorToast, successToast } from "@/core/core.function";
import { downloadPurchaseRequestPdf } from "../lib/purchaseRequest.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { id, request_number, ap_order_quotation_id, status, approved } = row;
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const hasQuotation = ap_order_quotation_id !== null;
  const isLockedStatus = approved || status === "cancelled";
  const hideOptions = !hasQuotation && status === "pending";
  const hideOptionsDelete = status === "pending";

  const canNotify = permissions.canNotify && hideOptions && !!onNotifyManagers;
  const canApprove =
    permissions.canApprove && hideOptions && !isLockedStatus && !!onApprove;
  const canReject =
    permissions.canReject && hideOptions && !isLockedStatus && !!onCancel;
  const canUpdate = permissions.canUpdate && hideOptionsDelete;
  const canDelete = permissions.canDelete && hideOptionsDelete;

  const handleDownload = async (format: "pdf" | "excel") => {
    setIsDownloadingPdf(true);
    try {
      await downloadPurchaseRequestPdf(id, request_number, format);
      successToast(
        format === "excel"
          ? "Excel descargado correctamente para la solicitud de compra"
          : "PDF descargado correctamente para la solicitud de compra",
      );
    } catch {
      errorToast(
        format === "excel"
          ? "Error al descargar el Excel"
          : "Error al descargar el PDF",
      );
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Descargar"
            disabled={isDownloadingPdf}
          >
            {isDownloadingPdf ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Descargar</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => handleDownload("pdf")}
            disabled={isDownloadingPdf}
          >
            <FileText className="size-4 mr-2" />
            PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleDownload("excel")}
            disabled={isDownloadingPdf}
          >
            <FileSpreadsheet className="size-4 mr-2" />
            Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {canNotify && (
        <Button
          variant="outline"
          size="icon"
          className="size-7 text-blue-500 hover:text-blue-600"
          tooltip="Notificar a Jefatura"
          onClick={() => onNotifyManagers!(id)}
        >
          <BellRing className="size-5" />
        </Button>
      )}

      {canApprove && (
        <Button
          variant="outline"
          size="icon"
          className="size-7 text-green-600 hover:text-green-700"
          tooltip="Aprobar"
          onClick={() => onApprove!(id)}
        >
          <CheckCircle className="size-5" />
        </Button>
      )}

      {canReject && (
        <Button
          variant="outline"
          size="icon"
          className="size-7 text-red-500 hover:text-red-600"
          tooltip="Rechazar"
          onClick={() => onCancel!(id)}
        >
          <XCircle className="size-5" />
        </Button>
      )}

      {canUpdate && (
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

      {canDelete && <DeleteButton onClick={() => onDelete(id)} />}
    </div>
  );
};
