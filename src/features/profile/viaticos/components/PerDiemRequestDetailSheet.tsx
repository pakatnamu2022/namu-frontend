import { useQuery } from "@tanstack/react-query";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, FileDown } from "lucide-react";
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

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalle de Solicitud de Viáticos"
      size="3xl"
    >
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : request ? (
          <>
            <SheetHeader>
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-2xl">{request.code}</SheetTitle>
                  <SheetDescription>
                    Detalle de Solicitud de Viáticos
                  </SheetDescription>
                </div>
                <RequestStatusBadge status={request.status} />
              </div>
            </SheetHeader>

            {/* Botones de descarga */}
            <div className="flex flex-col sm:flex-row gap-2 w-full mt-4">
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

            <div className="mt-6 space-y-6">
              {/* Información General */}
              <GeneralInfoSection request={request} />

              {/* Detalle de Presupuesto */}
              <BudgetSection request={request} />

              {/* Comprobante de Depósito */}
              <DepositVoucherSection request={request} />

              {/* Resumen Financiero */}
              <FinancialSummarySection request={request} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              No se pudo cargar la información de la solicitud
            </p>
          </div>
        )}
      </SheetContent>
    </GeneralSheet>
  );
}
