"use client";

import { Button } from "@/components/ui/button";
import { Eye, Hotel, CheckCircle, Upload, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  confirmPerDiemRequest,
  generateMobilityPayroll,
} from "../lib/perDiemRequest.actions";
import { PER_DIEM_REQUEST } from "../lib/perDiemRequest.constants";
import { useState } from "react";
import { errorToast, successToast } from "@/core/core.function";

interface PerDiemRequestRowActionsProps {
  request: PerDiemRequestResource;
  onViewDetail: (id: number) => void;
  onViewHotelReservation?: (requestId: number) => void;
}

export function PerDiemRequestRowActions({
  request,
  onViewDetail,
  onViewHotelReservation,
}: PerDiemRequestRowActionsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const hasHotelReservation = !!request.hotel_reservation;
  const isApproved =
    request.status === "approved" || request.status === "in_progress";
  const isOnlyApproved = request.status === "approved";
  const hotel = request.hotel_reservation?.hotel_name;
  const withRequest = request.with_request;
  const isCancelled = request.status === "cancelled";

  const confirmMutation = useMutation({
    mutationFn: (requestId: number) => confirmPerDiemRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY],
      });
      successToast("Solicitud confirmada y pasada a en progreso");
      setIsConfirmDialogOpen(false);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al confirmar la solicitud"
      );
    },
  });

  const generateMobilityPayrollMutation = useMutation({
    mutationFn: (requestId: number) => generateMobilityPayroll(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY],
      });
      successToast("Planilla de gastos de movilidad generada exitosamente");
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ||
          "Error al generar la planilla de movilidad"
      );
    },
  });

  const handleConfirmRequest = () => {
    confirmMutation.mutate(request.id);
  };

  const handleGenerateMobilityPayroll = () => {
    generateMobilityPayrollMutation.mutate(request.id);
  };

  const handleAddHotelReservation = () => {
    navigate(
      `/gp/gestion-humana/viaticos/solicitud-viaticos/${request.id}/reserva-hotel/agregar`
    );
  };

  const handleSeeReservation = () => {
    if (onViewHotelReservation) {
      onViewHotelReservation(request.id);
    } else {
      navigate(
        `/gp/gestion-humana/viaticos/solicitud-viaticos/${request.id}/reserva-hotel/detalle`
      );
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

        {!request.mobility_payroll_generated && (
          <Button
            variant="outline"
            size="icon-xs"
            onClick={handleGenerateMobilityPayroll}
            tooltip="Generar Planilla de Gastos de Movilidad"
            disabled={generateMobilityPayrollMutation.isPending}
          >
            <Car className="size-4" />
          </Button>
        )}

        {isOnlyApproved && request.with_request && request.paid && (
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

        {withRequest && (
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() =>
              navigate(
                `/gp/gestion-humana/viaticos/solicitud-viaticos/${request.id}/deposito`
              )
            }
            tooltip="Subir archivo de depósito"
          >
            <Upload className="size-4" />
          </Button>
        )}

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
            hasHotelReservation ? `Hotel: ${hotel}` : "Agregar reserva de hotel"
          }
          disabled={!isApproved}
        >
          <Hotel className="size-4" />
        </Button>
      </div>
    </>
  );
}
