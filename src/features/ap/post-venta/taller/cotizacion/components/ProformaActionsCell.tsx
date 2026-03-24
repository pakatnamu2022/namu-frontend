import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Settings, ClipboardCheck, Send, Loader2, Pencil } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { errorToast, successToast } from "@/core/core.function";
import { OrderQuotationResource } from "../lib/proforma.interface";
import { downloadOrderQuotationPdf } from "../lib/proforma.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionsCellProps {
  row: OrderQuotationResource;
  permissions: {
    canApprove: boolean;
    canManage: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  onManage: (id: number) => void;
  onSendNotification: (id: number) => void;
  onApprove: (id: number) => void;
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ProformaActionsCell = ({
  row,
  permissions,
  onManage,
  onSendNotification,
  onApprove,
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

  const handleSendNotification = async () => {
    setIsSendingNotification(true);
    try {
      await onSendNotification(id);
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleDownloadPdf = async (withCode: boolean) => {
    try {
      await downloadOrderQuotationPdf(id, withCode);
      successToast("PDF descargado correctamente");
    } catch {
      errorToast("Error al descargar el PDF");
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
          >
            <Download className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleDownloadPdf(true)}>
            <Download className="size-4 mr-2" />
            PDF con código
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadPdf(false)}>
            <Download className="size-4 mr-2" />
            PDF sin código
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
