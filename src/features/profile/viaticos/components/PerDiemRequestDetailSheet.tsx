import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileDown, Receipt } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import {
  findPerDiemRequestById,
  downloadContributorExpenseDetailsPdf,
  generateMobilityPayrollPdf,
} from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import {
  GeneralInfoSection,
  FinancialSummarySection,
  RequestStatusBadge,
  BudgetSection,
  DepositVoucherSection,
} from "@/features/profile/viaticos/components/PerDiemRequestDetail";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { errorToast, successToast } from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import ExpensesTable from "@/features/profile/viaticos/components/ExpensesTable";

interface Props {
  requestId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PerDiemRequestDetailSheet({
  requestId,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingMobilityPayroll, setIsDownloadingMobilityPayroll] =
    useState(false);

  const { data: request, isLoading } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, requestId],
    queryFn: () => findPerDiemRequestById(requestId!),
    enabled: open && requestId !== null,
  });

  const handleDownloadPdf = async () => {
    if (!requestId) return;

    try {
      setIsDownloading(true);
      await downloadContributorExpenseDetailsPdf(requestId);
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
    if (!requestId) return;
    try {
      setIsDownloadingMobilityPayroll(true);
      await generateMobilityPayrollPdf(requestId);
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

  if (isLoading || !request) {
    return (
      <GeneralSheet
        open={open}
        onClose={() => onOpenChange(false)}
        icon="PlaneLanding"
        title="Cargando..."
        size="3xl"
      >
        <FormSkeleton />
      </GeneralSheet>
    );
  }

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      icon="PlaneLanding"
      title={request.code}
      subtitle="Detalle de Solicitud de Viáticos"
      size="3xl"
    >
      <div className="flex justify-between items-center w-full">
        {/* Botones de descarga */}
        <div className="flex flex-col sm:flex-row gap-2">
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
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      <div className="mt-6 space-y-6">
        {/* Información General */}
        <GeneralInfoSection request={request} />

        {/* Detalle de Presupuesto */}
        <BudgetSection request={request} />

        {/* Comprobante de Depósito */}
        {request.settled && (
          <DepositVoucherSection
            request={request}
            onVoucherDeleted={() => {
              queryClient.invalidateQueries({
                queryKey: [PER_DIEM_REQUEST.QUERY_KEY, requestId],
              });
            }}
          />
        )}

        {/* Resumen Financiero */}
        <FinancialSummarySection request={request} mode="sheet" />

        {/* Gastos Registrados */}
        {request.expenses && request.expenses.length > 0 && (
          <GroupFormSection
            title="Gastos Registrados"
            icon={Receipt}
            cols={{ sm: 1 }}
          >
            <div className="md:col-span-1">
              <ExpensesTable
                expenses={request.expenses}
                module="profile"
              />
            </div>
          </GroupFormSection>
        )}
      </div>
    </GeneralSheet>
  );
}
