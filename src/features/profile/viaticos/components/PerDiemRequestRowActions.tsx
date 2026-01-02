"use client";

import { Button } from "@/components/ui/button";
import {
  Eye,
  Hotel,
  CheckCircle,
  Upload,
  FileCheck2,
  Download,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  confirmPerDiemRequest,
  completeSettlement,
  expenseTotalWithEvidencePdf,
} from "../lib/perDiemRequest.actions";
import { PER_DIEM_REQUEST } from "../lib/perDiemRequest.constants";
import { useState } from "react";
import { errorToast, successToast } from "@/core/core.function";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PerDiemRequestRowActionsProps {
  request: PerDiemRequestResource;
  onViewDetail: (id: number) => void;
  onViewHotelReservation?: (requestId: number) => void;
  module: "gh" | "contabilidad";
}

export function PerDiemRequestRowActions({
  request,
  onViewDetail,
  onViewHotelReservation,
  module = "gh",
}: PerDiemRequestRowActionsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCompleteSettlementDialogOpen, setIsCompleteSettlementDialogOpen] =
    useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const hasHotelReservation = !!request.hotel_reservation;
  const isApproved =
    request.status === "approved" || request.status === "in_progress";
  const isOnlyApproved = request.status === "approved";
  const hotel = request.hotel_reservation?.hotel_name;
  const isCancelled = request.status === "cancelled";
  const canCompleteSettlement = request.settlement_status === "approved";

  const confirmMutation = useMutation({
    mutationFn: (requestId: number) => confirmPerDiemRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY],
      });
      successToast("Solicitud confirmada y pasada a en progreso ");
      setIsConfirmDialogOpen(false);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al confirmar la solicitud"
      );
    },
  });

  const [settlementComments, setSettlementComments] = useState("");

  const completeSettlementMutation = useMutation({
    mutationFn: ({
      requestId,
      comments,
    }: {
      requestId: number;
      comments?: string;
    }) => completeSettlement(requestId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY],
      });
      successToast("Liquidación completada exitosamente");
      setIsCompleteSettlementDialogOpen(false);
      setSettlementComments("");
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al completar la liquidación"
      );
    },
  });

  const handleConfirmRequest = () => {
    confirmMutation.mutate(request.id);
  };

  const handleCompleteSettlement = () => {
    completeSettlementMutation.mutate({
      requestId: request.id,
      comments: settlementComments || undefined,
    });
  };

  const prefix =
    module === "gh"
      ? "/gp/gestion-humana/viaticos/solicitud-viaticos"
      : "/ap/contabilidad/viaticos-ap";

  const handleAddHotelReservation = () => {
    navigate(`${prefix}/${request.id}/reserva-hotel/agregar`);
  };

  const handleSeeReservation = () => {
    if (onViewHotelReservation) {
      onViewHotelReservation(request.id);
    } else {
      navigate(`${prefix}/${request.id}/reserva-hotel/detalle`);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await expenseTotalWithEvidencePdf(request.id);
      successToast("PDF descargado correctamente");
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isCancelled)
    return (
      <div className="flex items-center gap-2 justify-center">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onViewDetail(request.id)}
          tooltip="Ver detalle"
        >
          <Eye className="size-4" />
        </Button>
      </div>
    );

  return (
    <>
      <div className="flex items-center gap-2 justify-center">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onViewDetail(request.id)}
          tooltip="Ver detalle"
        >
          <Eye className="size-4" />
        </Button>

        {request.settled &&
          request.status === "settled" &&
          module === "contabilidad" && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={handleDownloadPdf}
              tooltip={isDownloading ? "Generando PDF..." : "Descargar PDF"}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Download className="size-5" />
              )}
            </Button>
          )}

        {request.days_count > 1 && module === "gh" && (
          <Button
            variant={hasHotelReservation ? "default" : "outline"}
            size="icon-xs"
            onClick={
              isApproved
                ? hasHotelReservation
                  ? handleSeeReservation
                  : handleAddHotelReservation
                : undefined
            }
            tooltip={
              hasHotelReservation
                ? `Hotel: ${hotel}`
                : "Agregar reserva de hotel"
            }
            disabled={!isApproved}
          >
            <Hotel className="size-4" />
          </Button>
        )}

        {isOnlyApproved && request.days_count === 1 && (
          <ConfirmationDialog
            trigger={
              <Button
                variant="default"
                size="icon-xs"
                tooltip="Confirmar solicitud"
                disabled={confirmMutation.isPending}
              >
                <CheckCircle className="size-4" />
              </Button>
            }
            title="¿Confirmar solicitud de viáticos?"
            description="Esta acción cambiará el estado de la solicitud a 'En Progreso' y podrás comenzar a registrar gastos. ¿Deseas continuar?"
            confirmText="Sí, confirmar"
            cancelText="Cancelar"
            onConfirm={handleConfirmRequest}
            variant="default"
            icon="info"
            open={isConfirmDialogOpen}
            onOpenChange={setIsConfirmDialogOpen}
          />
        )}

        {module === "contabilidad" &&
          request.settlement_status === "approved" &&
          request.end_date &&
          new Date(
            new Date(request.end_date).getTime() + 3 * 24 * 60 * 60 * 1000
          ) <= new Date() && (
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => navigate(`${prefix}/${request.id}/deposito`)}
              tooltip="Subir archivo de depósito"
            >
              <Upload className="size-4" />
            </Button>
          )}

        {canCompleteSettlement && module === "contabilidad" && (
          <ConfirmationDialog
            trigger={
              <Button
                variant="default"
                size="icon-xs"
                tooltip="Completar liquidación"
                disabled={completeSettlementMutation.isPending}
              >
                <FileCheck2 className="size-4" />
              </Button>
            }
            title="¿Completar liquidación?"
            description="Esta acción completará el proceso de liquidación. El jefe ya aprobó la liquidación. ¿Deseas continuar?"
            confirmText="Sí, completar"
            cancelText="Cancelar"
            onConfirm={handleCompleteSettlement}
            variant="default"
            icon="info"
            open={isCompleteSettlementDialogOpen}
            onOpenChange={setIsCompleteSettlementDialogOpen}
            confirmDisabled={completeSettlementMutation.isPending}
          >
            <div className="space-y-2">
              <Label htmlFor="settlement-comments">
                Comentarios (Opcional)
              </Label>
              <Textarea
                id="settlement-comments"
                placeholder="Ingrese sus comentarios aquí..."
                value={settlementComments}
                onChange={(e) => setSettlementComments(e.target.value)}
                rows={4}
                disabled={completeSettlementMutation.isPending}
              />
            </div>
          </ConfirmationDialog>
        )}
      </div>
    </>
  );
}
