import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Settings,
  ClipboardCheck,
  Send,
  Loader2,
  Pencil,
  Copy,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { errorToast, successToast } from "@/core/core.function";
import { OrderQuotationResource } from "../lib/proforma.interface";
import { downloadOrderQuotationPdf } from "../lib/proforma.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";

interface ActionsCellProps {
  row: OrderQuotationResource;
  permissions: {
    canApprove: boolean;
    canDuplicate: boolean;
    canManage: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  onManage: (id: number) => void;
  onSendNotification: (id: number) => void;
  onApprove: (id: number) => void;
  onDuplicate: (id: number) => void;
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ProformaActionsCell = ({
  row,
  permissions,
  onManage,
  onSendNotification,
  onApprove,
  onDuplicate,
  onUpdate,
  onDelete,
}: ActionsCellProps) => {
  const {
    id,
    chief_approval_by,
    manager_approval_by,
    has_management_discount,
    is_requested_by_management,
  } = row;
  const isFullyApproved = !!chief_approval_by && !!manager_approval_by;
  const isLocked = isFullyApproved || !!has_management_discount;
  const canSendNotification = is_requested_by_management;

  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleSendNotification = async () => {
    setIsSendingNotification(true);
    try {
      await onSendNotification(id);
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleDownloadPdf = async (
    withCode: boolean,
    format: "pdf" | "excel" = "pdf",
  ) => {
    setIsDownloadingPdf(true);
    try {
      await downloadOrderQuotationPdf(id, withCode, format);
      successToast(
        format === "excel"
          ? "Excel descargado correctamente"
          : "PDF descargado correctamente",
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
      {permissions.canManage && (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onManage(id)}
          tooltip="Gestionar"
        >
          <Settings className="size-5" />
        </Button>
      )}

      {canSendNotification && (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={handleSendNotification}
          disabled={isSendingNotification}
          tooltip="Enviar notificación a gerencia"
        >
          {isSendingNotification ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Send className="size-5" />
          )}
        </Button>
      )}

      {permissions.canApprove && !isFullyApproved && (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onApprove(id)}
          tooltip="Aprobar"
        >
          <ClipboardCheck className="size-5" />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Descargar PDF"
            disabled={isDownloadingPdf}
          >
            {isDownloadingPdf ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>PDF</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => handleDownloadPdf(true, "pdf")}
            disabled={isDownloadingPdf}
          >
            <FileText className="size-4 mr-2" />
            PDF con código
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDownloadPdf(false, "pdf")}
            disabled={isDownloadingPdf}
          >
            <FileText className="size-4 mr-2" />
            PDF sin código
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Excel</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => handleDownloadPdf(true, "excel")}
            disabled={isDownloadingPdf}
          >
            <FileSpreadsheet className="size-4 mr-2" />
            Excel con código
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDownloadPdf(false, "excel")}
            disabled={isDownloadingPdf}
          >
            <FileSpreadsheet className="size-4 mr-2" />
            Excel sin código
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {permissions.canDuplicate && (
        <ConfirmationDialog
          trigger={
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Duplicar"
            >
              <Copy className="size-5" />
            </Button>
          }
          title="¿Duplicar cotización?"
          description="Se creará una nueva cotización con los mismos datos. ¿Estás seguro de que deseas duplicar este registro?"
          confirmText="Sí, duplicar"
          cancelText="Cancelar"
          icon="info"
          onConfirm={() => onDuplicate(id)}
        />
      )}

      {permissions.canUpdate && !isLocked && (
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

      {permissions.canDelete && !isLocked && (
        <DeleteButton onClick={() => onDelete(id)} />
      )}
    </div>
  );
};
