import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Settings,
  ClipboardCheck,
  Pencil,
  Download,
  Loader2,
  BookMarked,
  CarFront,
  Handshake,
  Ban,
  RotateCcw,
} from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { WorkOrderResource } from "../lib/workOrder.interface";
import {
  finishAllowedStatuses,
  STATUS_WORK_ORDER,
} from "../lib/workOrder.constants";
import {
  INTERNA_CC,
  INTERNA_SC,
} from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.constants";
import { errorToast, successToast } from "@/core/core.function";
import { downloadDeliveryPdf } from "../lib/workOrder.actions";
import { useSendToFinished, useRevertFinished } from "../lib/workOrder.hook";
import { WorkOrderDeliverySheet } from "./WorkOrderDeliverySheet";
import { CancelWorkOrderModal } from "./CancelWorkOrderModal";

interface WorkOrderActionCellProps {
  row: WorkOrderResource;
  permissions: {
    canReceive: boolean;
    canManage: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canGenerateInternalNote: boolean;
  };
  onInternalNote: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onManage: (id: number) => void;
  onInspect: (id: number) => void;
  onCancel: (id: number) => void;
  onDelivery?: (id: number) => void;
}

export function WorkOrderActionCell({
  row,
  permissions,
  onInternalNote,
  onDelete,
  onUpdate,
  onManage,
  onInspect,
  onCancel,
  onDelivery,
}: WorkOrderActionCellProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const { mutateAsync: sendToFinished, isPending: isSendingToFinished } =
    useSendToFinished();
  const { mutateAsync: revertFinished, isPending: isReverting } =
    useRevertFinished();
  const {
    id,
    is_inspection_completed,
    status_id,
    is_delivery,
    is_invoiced,
    items,
  } = row;
  const isClosed = status_id == String(STATUS_WORK_ORDER.CERRADO);
  const isOpen = status_id == String(STATUS_WORK_ORDER.APERTURADO);
  const isCancelled = status_id == String(STATUS_WORK_ORDER.ANULADO);
  const isDelivery = is_delivery;
  const firstItemPlanning = items?.[0]?.type_planning;

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

  const handleSendToFinished = async () => {
    try {
      await sendToFinished(id);
      successToast("Orden enviada a facturar exitosamente");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al enviar a facturar";
      errorToast(message);
    }
  };

  const handleRevertFinished = async () => {
    try {
      await revertFinished(id);
      successToast("Orden revertida exitosamente");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error al revertir la orden";
      errorToast(message);
    }
  };

  const isVisibleReceive =
    permissions.canReceive &&
    !is_inspection_completed &&
    !isClosed &&
    firstItemPlanning?.validate_receipt;

  const isVisibleManage = permissions.canManage;

  const isInterna =
    firstItemPlanning?.type_document === INTERNA_SC ||
    firstItemPlanning?.type_document === INTERNA_CC;

  const isVisibleFinish =
    !is_invoiced &&
    !isClosed &&
    !isInterna &&
    finishAllowedStatuses.includes(Number(status_id));

  const isVisibleRevert =
    !is_invoiced &&
    !isClosed &&
    !isInterna &&
    status_id == String(STATUS_WORK_ORDER.TERMINADO);

  const isVisibleDelivery =
    !isDelivery &&
    !isInterna &&
    (status_id == String(STATUS_WORK_ORDER.TERMINADO) || isClosed);

  const isVisiblePdfDelivery = (isDelivery || isClosed) && !isInterna;

  const isVisibleGenerateInternalNote =
    permissions.canGenerateInternalNote && !isClosed && isInterna;

  const isOpenForEdit = permissions.canUpdate && isOpen;

  const isOpenForDelete = permissions.canDelete && isOpen;

  const idVisibleCancel = !isCancelled && !isClosed && !isDelivery;

  return (
    <div className="flex items-center gap-2">
      {isVisibleReceive && (
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

      {isVisibleManage && (
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

      {isVisibleFinish && (
        <ConfirmationDialog
          title="¿Habilitar para Emitir Factura Final?"
          description="Esta acción marcará la orden de trabajo como lista para emitir la factura final. ¿Deseas continuar?"
          confirmText="Sí, continuar"
          cancelText="Cancelar"
          icon="info"
          onConfirm={handleSendToFinished}
          trigger={
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              disabled={isSendingToFinished}
              tooltip={
                isSendingToFinished ? "Enviando..." : "Marcar como Finalizada"
              }
            >
              {isSendingToFinished ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Handshake className="size-5" />
              )}
            </Button>
          }
        />
      )}

      {isVisibleRevert && (
        <ConfirmationDialog
          title="¿Revertir Emisión de Factura Final?"
          description="Esta acción revertirá el estado de la orden de trabajo. ¿Estás seguro de que deseas continuar?"
          confirmText="Sí, revertir"
          cancelText="Cancelar"
          icon="info"
          onConfirm={handleRevertFinished}
          trigger={
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              disabled={isReverting}
              tooltip={isReverting ? "Revirtiendo..." : "Revertir Finalización"}
            >
              {isReverting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <RotateCcw className="size-5" />
              )}
            </Button>
          }
        />
      )}

      {isVisiblePdfDelivery && (
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

      {isVisibleDelivery && (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          tooltip="Entrega de Vehículo"
          onClick={() => setIsDeliveryOpen(true)}
        >
          <CarFront className="size-5" />
        </Button>
      )}

      {isVisibleGenerateInternalNote && (
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

      {isOpenForEdit && (
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

      {isOpenForDelete && <DeleteButton onClick={() => onDelete(id)} />}

      {idVisibleCancel && (
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          tooltip="Cancelar Orden"
          onClick={() => setIsCancelOpen(true)}
        >
          <Ban className="size-5" />
        </Button>
      )}

      <WorkOrderDeliverySheet
        open={isDeliveryOpen}
        onClose={() => setIsDeliveryOpen(false)}
        workOrderId={id}
        onSuccess={() => onDelivery?.(id)}
      />

      <CancelWorkOrderModal
        open={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        workOrderId={id}
        onSuccess={() => onCancel(id)}
      />
    </div>
  );
}
