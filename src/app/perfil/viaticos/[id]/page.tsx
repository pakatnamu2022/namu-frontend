"use client";

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PER_DIEM_REQUEST,
  PER_DIEM_STATUS,
} from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import {
  findPerDiemRequestById,
  downloadSettlementPdf,
  downloadExpenseDetailPdf,
  downloadMobilityPayrollPdf,
} from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { useState } from "react";
import { toast } from "sonner";
import TitleComponent from "@/shared/components/TitleComponent";
import {
  GeneralInfoSection,
  ExpensesSection,
  RequestStatusBadge,
} from "@/features/profile/viaticos/components/PerDiemRequestDetail";
import FormWrapper from "@/shared/components/FormWrapper";
import BackButton from "@/shared/components/BackButton";

export default function PerDiemRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingExpenseDetail, setIsDownloadingExpenseDetail] =
    useState(false);
  const [isDownloadingMobilityPayroll, setIsDownloadingMobilityPayroll] =
    useState(false);

  const { data: request, isLoading } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
    queryFn: () => findPerDiemRequestById(Number(id)),
    enabled: !!id,
  });

  const handleDownloadPdf = async () => {
    if (!id) return;

    try {
      setIsDownloading(true);
      await downloadSettlementPdf(Number(id));
      toast.success("PDF descargado correctamente");
    } catch (error) {
      toast.error("Error al descargar el PDF");
      console.error("Error downloading PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadExpenseDetailPdf = async () => {
    if (!id) return;

    try {
      setIsDownloadingExpenseDetail(true);
      await downloadExpenseDetailPdf(Number(id));
      toast.success("PDF de detalle de gastos descargado correctamente");
    } catch (error) {
      toast.error("Error al descargar el PDF de detalle de gastos");
      console.error("Error downloading expense detail PDF:", error);
    } finally {
      setIsDownloadingExpenseDetail(false);
    }
  };

  const handleDownloandMobilityPayrollPdf = async () => {
    if (!id) return;
    try {
      setIsDownloadingMobilityPayroll(true);
      await downloadMobilityPayrollPdf(Number(id));
      toast.success("PDF de planilla de movilidad descargado correctamente");
    } catch (error) {
      toast.error("Error al descargar el PDF de planilla de movilidad");
      console.error("Error downloading mobility payroll PDF:", error);
    } finally {
      setIsDownloadingMobilityPayroll(false);
    }
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
                  {isDownloading ? "Descargando..." : "Exportar PDF"}
                </span>
              </Button>

              <Button
                onClick={handleDownloadExpenseDetailPdf}
                size="sm"
                variant="outline"
                className="gap-2 w-full sm:w-auto"
                disabled={isDownloadingExpenseDetail}
              >
                <FileDown className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {isDownloadingExpenseDetail
                    ? "Descargando..."
                    : "Detalle de Gastos"}
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
              )}
            </div>
          </div>
        </FormWrapper>

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
