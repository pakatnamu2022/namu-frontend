import { Button } from "@/components/ui/button";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";
import {
  Download,
  Eye,
  Link2,
  Loader2,
  PackageOpen,
  Pencil,
  Percent,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { errorToast, successToast } from "@/core/core.function";
import { useState } from "react";
import { downloadOrderQuotationPdf } from "../../../taller/cotizacion/lib/proforma.actions";
import { DiscardQuotationModal } from "./DiscardQuotationModal";
import { sendVirtualConfirmation } from "../lib/quotationMeson.actions";
import { VirtualConfirmationDialog } from "./VirtualConfirmationDialog";

interface ActionsCellProps {
  row: OrderQuotationResource;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
  onViewBilling: (orderQuotation: OrderQuotationResource) => void;
  onViewDelivery: (orderQuotation: OrderQuotationResource) => void;
  onRequestDiscount: (id: number) => void;
  onRefresh: () => void;
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ProformaMesonActionsCell = ({
  row,
  permissions,
  onViewBilling,
  onViewDelivery,
  onRequestDiscount,
  onRefresh,
  onUpdate,
  onDelete,
}: ActionsCellProps) => {
  const { id, is_fully_paid, status, has_invoice_generated } = row;
  const isDiscarded = status === "Descartado";
  const isForInvoicing = status === "Por Facturar";
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [virtualConfirmationData, setVirtualConfirmationData] = useState<{
    confirmationLink: string;
    sentTo: string;
    expiresAt: string;
  } | null>(null);

  const handleSendVirtualLink = async () => {
    setIsSendingLink(true);
    try {
      const result = await sendVirtualConfirmation(id);
      if (result.success) {
        setVirtualConfirmationData({
          confirmationLink: result.confirmation_link,
          sentTo: result.sent_to,
          expiresAt: result.expires_at,
        });
        successToast("Link de confirmación enviado al cliente");
      }
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ||
          "Error al enviar el link de confirmación",
      );
    } finally {
      setIsSendingLink(false);
    }
  };

  const handleDownloadPdf = async (withCode: boolean) => {
    setIsDownloadingPdf(true);
    try {
      await downloadOrderQuotationPdf(id, withCode);
      successToast("PDF descargado correctamente");
    } catch {
      errorToast("Error al descargar el PDF");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onViewBilling(row)}
          tooltip="Ver Información"
        >
          <Eye className="size-5" />
        </Button>

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
            <DropdownMenuItem
              onClick={() => handleDownloadPdf(true)}
              disabled={isDownloadingPdf}
            >
              <Download className="size-4 mr-2" />
              PDF con código
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDownloadPdf(false)}
              disabled={isDownloadingPdf}
            >
              <Download className="size-4 mr-2" />
              PDF sin código
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {!isDiscarded && is_fully_paid && (
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            tooltip="Ver / Generar Entrega"
            onClick={() => onViewDelivery(row)}
          >
            <PackageOpen className="size-5" />
          </Button>
        )}

        {!isDiscarded && !isForInvoicing && !has_invoice_generated && (
          <Button
            variant="outline"
            size="icon"
            className="size-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            tooltip="Enviar Link de Confirmación Virtual"
            onClick={handleSendVirtualLink}
            disabled={isSendingLink}
          >
            {isSendingLink ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Link2 className="size-4" />
            )}
          </Button>
        )}

        {!isDiscarded && !has_invoice_generated && !isForInvoicing && (
          <Button
            variant="outline"
            size="icon"
            className="size-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            tooltip="Solicitar Descuento"
            onClick={() => onRequestDiscount(id)}
          >
            <Percent className="size-5" />
          </Button>
        )}

        {!isDiscarded && !has_invoice_generated && (
          <Button
            variant="outline"
            size="icon"
            className="size-7 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            tooltip="Descartar Cotización"
            onClick={() => setShowDiscardModal(true)}
          >
            <XCircle className="size-5" />
          </Button>
        )}

        {!isDiscarded &&
          !isForInvoicing &&
          permissions.canUpdate &&
          !has_invoice_generated && (
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

        {!isDiscarded &&
          !isForInvoicing &&
          permissions.canDelete &&
          !has_invoice_generated && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
      </div>

      <DiscardQuotationModal
        open={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        quotationId={id}
        onSuccess={onRefresh}
      />

      {virtualConfirmationData && (
        <VirtualConfirmationDialog
          open={true}
          onClose={() => setVirtualConfirmationData(null)}
          confirmationLink={virtualConfirmationData.confirmationLink}
          sentTo={virtualConfirmationData.sentTo}
          expiresAt={virtualConfirmationData.expiresAt}
          quotationId={id}
        />
      )}
    </>
  );
};
