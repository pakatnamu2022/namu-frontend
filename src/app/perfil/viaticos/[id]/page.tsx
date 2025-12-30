"use client";

import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileDown, XCircle, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PER_DIEM_REQUEST,
  PER_DIEM_STATUS,
} from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import {
  findPerDiemRequestById,
  downloadMobilityPayrollPdf,
  cancelPerDiemRequest,
  startSettlement,
  downloadContributorExpenseDetailsPdf,
} from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import {
  GeneralInfoSection,
  ExpensesSection,
  RequestStatusBadge,
} from "@/features/profile/viaticos/components/PerDiemRequestDetail";
import FormWrapper from "@/shared/components/FormWrapper";
import BackButton from "@/shared/components/BackButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { errorToast, successToast } from "@/core/core.function";

export default function PerDiemRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingMobilityPayroll, setIsDownloadingMobilityPayroll] =
    useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showStartSettlementDialog, setShowStartSettlementDialog] =
    useState(false);

  const { data: request, isLoading } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
    queryFn: () => findPerDiemRequestById(Number(id)),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: number) => cancelPerDiemRequest(requestId),
    onSuccess: () => {
      successToast("Solicitud cancelada correctamente");
      queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
      });
      setShowCancelDialog(false);
    },
    onError: () => {
      errorToast("Error al cancelar la solicitud");
    },
  });

  const startSettlementMutation = useMutation({
    mutationFn: (requestId: number) => startSettlement(requestId),
    onSuccess: () => {
      successToast("Proceso de liquidación iniciado correctamente");
      queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
      });
      setShowStartSettlementDialog(false);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? "Error al iniciar la liquidación"
      );
    },
  });

  const handleDownloadPdf = async () => {
    if (!id) return;

    try {
      setIsDownloading(true);
      await downloadContributorExpenseDetailsPdf(Number(id));
      successToast("Detalle de Gastos descargado correctamente");
    } catch (error: any) {
      const msjError =
        error.response?.data?.message || "Error al descargar el PDF";
      errorToast(msjError);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloandMobilityPayrollPdf = async () => {
    if (!id) return;
    try {
      setIsDownloadingMobilityPayroll(true);
      await downloadMobilityPayrollPdf(Number(id));
      successToast("PDF de planilla de movilidad descargado correctamente");
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ||
          "Error al descargar el PDF de planilla de movilidad"
      );
    } finally {
      setIsDownloadingMobilityPayroll(false);
    }
  };

  const handleCancelRequest = () => {
    if (!id) return;
    cancelMutation.mutate(Number(id));
  };

  const handleStartSettlement = () => {
    if (!id) return;
    startSettlementMutation.mutate(Number(id));
  };

  // Verificar si se puede cancelar la solicitud
  const canCancelRequest = () => {
    if (!request) return false;

    // No se puede cancelar si ya está en progreso
    if (request.status === PER_DIEM_STATUS.IN_PROGRESS) return false;

    // No se puede cancelar si ya tiene una reserva de hotel
    if (request.hotel_reservation) return false;

    // Solo se puede cancelar si está aprobada
    if (request.status === PER_DIEM_STATUS.APPROVED) return true;

    return false;
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </FormWrapper>
    );
  }

  if (!request) {
    return (
      <FormWrapper>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Solicitud no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="space-y-6">
        {/* Header */}
        <FormWrapper>
          <div className="flex flex-col gap-4">
            {/* Título y Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <BackButton route="/perfil/viaticos" size="icon" name="" />
                <TitleComponent
                  title={request.code}
                  subtitle="Detalle de Solicitud de Viáticos"
                  icon="FileText"
                />
              </div>
              <RequestStatusBadge status={request.status} />
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={handleDownloadPdf}
                size="sm"
                variant="outline"
                className="gap-2 w-full sm:w-auto"
                disabled={isDownloading}
              >
                <FileDown className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {isDownloading ? "Descargando..." : "Detalle de Gastos"}
                </span>
              </Button>

              <Button
                onClick={handleDownloandMobilityPayrollPdf}
                size="sm"
                variant="outline"
                className="gap-2 w-full sm:w-auto"
                disabled={isDownloadingMobilityPayroll}
              >
                <FileDown className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {isDownloadingMobilityPayroll
                    ? "Descargando..."
                    : "Planilla de Movilidad"}
                </span>
              </Button>

              {request.status === PER_DIEM_STATUS.IN_PROGRESS && (
                <>
                  <Button
                    onClick={() =>
                      navigate(`/perfil/viaticos/${id}/gastos/agregar`)
                    }
                    size="sm"
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span className="truncate">Nuevo Gasto</span>
                  </Button>
                  <Button
                    onClick={() => setShowStartSettlementDialog(true)}
                    size="sm"
                    variant="default"
                    className="gap-2 w-full sm:w-auto"
                    disabled={startSettlementMutation.isPending}
                  >
                    <FileCheck className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {startSettlementMutation.isPending
                        ? "Iniciando..."
                        : "Iniciar Liquidación"}
                    </span>
                  </Button>
                </>
              )}

              {canCancelRequest() && (
                <Button
                  onClick={() => setShowCancelDialog(true)}
                  size="sm"
                  variant="destructive"
                  className="gap-2 w-full sm:w-auto"
                  disabled={cancelMutation.isPending}
                >
                  <XCircle className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {cancelMutation.isPending
                      ? "Cancelando..."
                      : "Cancelar Solicitud"}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </FormWrapper>

        {/* Diálogo de confirmación de cancelación */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Cancelar solicitud de viático?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción cancelará la solicitud de viático{" "}
                <strong>{request.code}</strong>. Esta acción no se puede
                deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, mantener</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelRequest}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sí, cancelar solicitud
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Diálogo de confirmación de iniciar liquidación */}
        <AlertDialog
          open={showStartSettlementDialog}
          onOpenChange={setShowStartSettlementDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Iniciar proceso de liquidación?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción iniciará el proceso de liquidación para la solicitud
                de viático <strong>{request.code}</strong>. Una vez iniciado, el
                jefe deberá aprobar la liquidación.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleStartSettlement}>
                Sí, iniciar liquidación
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Grid para Información General y Resumen Financiero */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Información General - 2/3 */}
          <div className="lg:col-span-2 h-full">
            <GeneralInfoSection request={request} />
          </div>

          {/* Resumen Financiero - 1/3 */}
          {/* <div className="lg:col-span-1 h-full">
            <FinancialSummarySection request={request} />
          </div> */}
        </div>

        {/* Gastos Registrados */}
        <ExpensesSection request={request} />
      </div>
    </FormWrapper>
  );
}
