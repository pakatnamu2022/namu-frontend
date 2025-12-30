"use client";

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import {
  findPerDiemRequestById,
  downloadExpenseTotalPdf,
  generateMobilityPayrollPdf,
} from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import {
  GeneralInfoSection,
  RequestStatusBadge,
  BudgetSection,
  FinancialSummarySection,
  DepositVoucherSection,
} from "@/features/profile/viaticos/components/PerDiemRequestDetail";
import FormWrapper from "@/shared/components/FormWrapper";
import BackButton from "@/shared/components/BackButton";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Receipt, Plane } from "lucide-react";
import ExpensesTable from "@/features/profile/viaticos/components/ExpensesTable";
import { errorToast, successToast } from "@/core/core.function";
import AddFlightTicketModal from "@/features/profile/viaticos/components/AddFlightTicketModal";

export default function PerDiemRequestDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAddFlightTicketModalOpen, setIsAddFlightTicketModalOpen] = useState(false);

  const {
    data: request,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
    queryFn: () => findPerDiemRequestById(Number(id)),
    enabled: !!id,
  });

  const [isDownloadingMobilityPayroll, setIsDownloadingMobilityPayroll] =
    useState(false);

  const handleDownloadPdf = async () => {
    if (!id) return;

    try {
      setIsDownloading(true);
      await downloadExpenseTotalPdf(Number(id));
      successToast("PDF descargado correctamente");
    } catch (error) {
      errorToast("Error al descargar el PDF");
      console.error("Error downloading PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloandMobilityPayrollPdf = async () => {
    if (!id) return;
    try {
      setIsDownloadingMobilityPayroll(true);
      await generateMobilityPayrollPdf(Number(id));
      successToast("PDF de planilla de movilidad descargado correctamente");
    } catch (error: any) {
      errorToast(
        error.response.data.message ??
          "Error al descargar el PDF de planilla de movilidad"
      );
    } finally {
      setIsDownloadingMobilityPayroll(false);
    }
  };

  const handleActionComplete = () => {
    refetch();
  };

  const isCancelled = request?.status === "cancelled";

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BackButton
                route="/gp/gestion-humana/viaticos/solicitud-viaticos"
                size="icon"
                name=""
              />
              <TitleComponent
                title={request.code}
                subtitle="Detalle de Solicitud de Viáticos"
                icon="FileText"
              />
            </div>

            <RequestStatusBadge status={request.status} />
          </div>

          {!isCancelled && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownloadPdf}
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={isDownloading}
              >
                <FileDown className="h-4 w-4" />
                {isDownloading ? "Descargando..." : "Detalle de Gastos"}
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
                    : "Generar Planilla de Movilidad"}
                </span>
              </Button>
            </div>
          )}
        </FormWrapper>

        {/* Información General */}
        <GeneralInfoSection request={request} />

        {/* Detalle de Presupuesto */}
        <BudgetSection request={request} />

        {/* Comprobante de Depósito */}
        {request.settled && <DepositVoucherSection request={request} />}

        {/* Resumen Financiero */}
        <FinancialSummarySection request={request} />

        {/* Gastos Registrados con acciones de validación */}
        <GroupFormSection
          title="Gastos Registrados"
          icon={Receipt}
          cols={{ sm: 1 }}
        >
          {/* Botón para agregar pasajes aéreos si with_active es false */}
          {!request.with_active && (
            <div className="mb-4 flex justify-end">
              <Button
                onClick={() => setIsAddFlightTicketModalOpen(true)}
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={
                  (request.expenses?.filter((e) =>
                    e.expense_type?.code?.toLowerCase().includes('boleto') ||
                    e.expense_type?.code?.toLowerCase().includes('aereo') ||
                    e.expense_type?.name?.toLowerCase().includes('boleto') ||
                    e.expense_type?.name?.toLowerCase().includes('aéreo')
                  ).length || 0) >= 2
                }
              >
                <Plane className="h-4 w-4" />
                Agregar Pasaje Aéreo
              </Button>
            </div>
          )}

          <div className="md:col-span-1">
            <ExpensesTable
              expenses={request.expenses || []}
              onActionComplete={handleActionComplete}
              module="gh"
            />
          </div>
        </GroupFormSection>

        {/* Modal para agregar pasajes aéreos */}
        {!request.with_active && (
          <AddFlightTicketModal
            requestId={Number(id)}
            open={isAddFlightTicketModalOpen}
            onOpenChange={setIsAddFlightTicketModalOpen}
            onSuccess={handleActionComplete}
            startDate={request.start_date ? new Date(request.start_date) : undefined}
            endDate={request.end_date ? new Date(request.end_date) : undefined}
            currentExpensesCount={
              request.expenses?.filter((e) =>
                e.expense_type?.code?.toLowerCase().includes('boleto') ||
                e.expense_type?.code?.toLowerCase().includes('aereo') ||
                e.expense_type?.name?.toLowerCase().includes('boleto') ||
                e.expense_type?.name?.toLowerCase().includes('aéreo')
              ).length || 0
            }
          />
        )}
      </div>
    </FormWrapper>
  );
}
