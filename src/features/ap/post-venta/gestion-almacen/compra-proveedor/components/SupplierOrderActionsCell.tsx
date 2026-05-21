import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Eye,
  Pencil,
  PackageCheck,
  Download,
  ShieldCheck,
  XCircle,
  Loader2,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { Link } from "react-router-dom";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { SupplierOrderResource } from "../lib/supplierOrder.interface.ts";
import { DiscardSupplierOrderModal } from "./DiscardSupplierOrderModal";

interface SupplierOrderActionsCellProps {
  row: SupplierOrderResource;
  onDelete: (id: number) => void;
  onView?: (id: number) => void;
  onApprove: (id: number) => void;
  onDownloadPdf: (id: number) => Promise<void>;
  permissions: {
    canApprove: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canView: boolean;
  };
  routeUpdate?: string;
  routeReception: string;
}

export const SupplierOrderActionsCell = ({
  row,
  onDelete,
  onView,
  onApprove,
  onDownloadPdf,
  permissions,
  routeUpdate,
  routeReception,
}: SupplierOrderActionsCellProps) => {
  const {
    id,
    order_number_external,
    has_receptions,
    has_receptions_active,
    has_receptions_annulled,
    approved_by,
    status,
  } = row;
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Derived booleans to simplify repeated conditions
  const isActive = Boolean(status);
  const canView = permissions.canView;
  const canApprove = permissions.canApprove && order_number_external === null;
  const canUpdateAndActive = permissions.canUpdate && isActive;
  const canReception = canUpdateAndActive;
  const canEdit = canUpdateAndActive && !has_receptions && Boolean(routeUpdate);
  const canDiscard =
    Boolean(has_receptions_annulled) && isActive && !has_receptions_active;
  const canDelete = permissions.canDelete && !has_receptions && isActive;

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await onDownloadPdf(id);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {canView && onView && (
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Ver"
            onClick={() => onView(id)}
          >
            <Eye className="size-4" />
          </Button>
        )}

        {canApprove && !approved_by && (
          <ConfirmationDialog
            trigger={
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                tooltip="Aprobar"
              >
                <ShieldCheck className="size-4" />
              </Button>
            }
            title="¿Aprobar orden de compra?"
            description="¿Estás seguro de que deseas aprobar esta orden de compra? Esta acción no se puede deshacer."
            confirmText="Sí, aprobar"
            cancelText="Cancelar"
            icon="info"
            onConfirm={() => onApprove(id)}
          />
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
            <Download className="size-4" />
          )}
        </Button>

        {canReception && (
          <Link to={`${routeReception}/${id}`}>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Recepcionar"
            >
              <PackageCheck className="size-4" />
            </Button>
          </Link>
        )}

        {canEdit && (
          <Link to={`${routeUpdate}/${id}`}>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
            >
              <Pencil className="size-4" />
            </Button>
          </Link>
        )}

        {canDiscard && (
          <Button
            variant="outline"
            size="icon"
            className="size-7 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            tooltip="Descartar Orden"
            onClick={() => setShowDiscardModal(true)}
          >
            <XCircle className="size-4" />
          </Button>
        )}

        {canDelete && <DeleteButton onClick={() => onDelete(id)} />}
      </div>

      <DiscardSupplierOrderModal
        open={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        supplierOrderId={id}
      />
    </>
  );
};
