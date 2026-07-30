import { Button } from "@/components/ui/button";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";
import {
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Link2,
  Loader2,
  PackageOpen,
  Pencil,
  Percent,
  Scissors,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { errorToast, successToast } from "@/core/core.function";
import { useState } from "react";
import { downloadOrderQuotationRepuestoPdf } from "../../../taller/cotizacion/lib/proforma.actions";
import { DiscardQuotationModal } from "./DiscardQuotationModal";
import {
  segmentOrderQuotationBySupplyType,
  sendVirtualConfirmation,
} from "../lib/quotationMeson.actions";
import { VirtualConfirmationDialog } from "./VirtualConfirmationDialog";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";

interface ActionsCellProps {
  row: OrderQuotationResource;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
    canApprove: boolean;
  };
  onViewBilling: (orderQuotation: OrderQuotationResource) => void;
  onViewDelivery: (orderQuotation: OrderQuotationResource) => void;
  onRequestDiscount: (id: number) => void;
  onApprove: (id: number) => void;
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
  onApprove,
  onRefresh,
  onUpdate,
  onDelete,
}: ActionsCellProps) => {
  const {
    id,
    is_fully_paid,
    status,
    has_invoice_generated,
    delivery_document_number,
    has_management_discount,
    parent_quotation_id,
    was_segmented,
  } = row;
  const isDiscarded = status === "Descartado";
  const isForInvoicing = status === "Por Facturar";
  const isDelivered = !!delivery_document_number;
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false);
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

  const handleSegment = async () => {
    setIsSegmenting(true);
    try {
      await segmentOrderQuotationBySupplyType(id);
      successToast("Cotización segmentada correctamente");
      onRefresh();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al segmentar la cotización",
      );
    } finally {
      setIsSegmenting(false);
    }
  };

  const handleDownloadPdf = async (
    withCode: boolean,
    format: "pdf" | "excel" = "pdf",
  ) => {
    setIsDownloadingPdf(true);
    try {
      await downloadOrderQuotationRepuestoPdf(id, withCode, format);
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

  const isVisibleGenerateDelivery =
    !isDiscarded && is_fully_paid && !isDelivered;

  const isVisibleSendVirtualLink =
    !isDiscarded && !isForInvoicing && !has_invoice_generated && !was_segmented;

  const isVisibleRequestDiscount =
    !isDiscarded && !has_invoice_generated && !isForInvoicing && !was_segmented;

  const isVisibleDiscard = !isDiscarded && (!was_segmented || isForInvoicing);

  const isVisibleSegment =
    !isDiscarded &&
    !has_invoice_generated &&
    !isForInvoicing &&
    !was_segmented &&
    !parent_quotation_id;

  const isVisibleApprove = permissions.canApprove && isForInvoicing;

  const isVisibleEdit =
    !isDiscarded &&
    !isForInvoicing &&
    permissions.canUpdate &&
    !has_management_discount &&
    !has_invoice_generated &&
    !was_segmented;

  const isVisibleDelete =
    !isDiscarded &&
    !isForInvoicing &&
    permissions.canDelete &&
    !has_management_discount &&
    !has_invoice_generated &&
    !was_segmented;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onViewBilling(row)}
          tooltip="Ver Detalles Cotización"
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

        {isVisibleGenerateDelivery && (
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

        {isVisibleSendVirtualLink && (
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

        {isVisibleRequestDiscount && (
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

        {isVisibleSegment && (
          <ConfirmationDialog
            trigger={
              <Button
                variant="outline"
                size="icon"
                className="size-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                tooltip="Segmentar Cotización"
                disabled={isSegmenting}
              >
                {isSegmenting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Scissors className="size-4" />
                )}
              </Button>
            }
            title="¿Segmentar cotización?"
            description="Esta acción dividirá la cotización según el tipo de suministro. ¿Estás seguro de que deseas continuar?"
            confirmText="Sí, segmentar"
            cancelText="Cancelar"
            icon="info"
            onConfirm={handleSegment}
          />
        )}

        {isVisibleDiscard && (
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

        {isVisibleApprove && (
          <Button
            variant="outline"
            size="icon"
            className="size-7 text-green-600 hover:text-green-700 hover:bg-green-50"
            tooltip="Aprobar Jefe / Gerente"
            onClick={() => onApprove(id)}
          >
            <ShieldCheck className="size-4" />
          </Button>
        )}

        {isVisibleEdit && (
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

        {isVisibleDelete && <DeleteButton onClick={() => onDelete(id)} />}
      </div>

      {showDiscardModal && (
        <DiscardQuotationModal
          open={showDiscardModal}
          onClose={() => setShowDiscardModal(false)}
          quotationId={id}
          onSuccess={onRefresh}
        />
      )}

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
