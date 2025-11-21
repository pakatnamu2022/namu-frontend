import { Button } from "@/components/ui/button";
import { FileText, Sheet } from "lucide-react";
import { Tooltip, TooltipTrigger } from "@radix-ui/react-tooltip";
import { errorToast, successToast } from "@/core/core.function";
import { downloadDashboardFile } from "../lib/dashboard.actions";

interface DashboardActionsProps {
  dateFrom?: Date;
  dateTo?: Date;
  dashboardType: "VISITA" | "LEADS";
}

export default function DashboardActions({
  dateFrom,
  dateTo,
  dashboardType,
}: DashboardActionsProps) {
  const formatDate = (date: Date | undefined) => {
    return date ? date.toISOString().split("T")[0] : "";
  };

  const handleExcelDownload = async () => {
    if (!dateFrom || !dateTo) {
      errorToast("Por favor seleccione un rango de fechas");
      return;
    }

    try {
      await downloadDashboardFile({
        date_from: formatDate(dateFrom),
        date_to: formatDate(dateTo),
        type: dashboardType,
      });
      successToast("Archivo Excel descargado exitosamente");
    } catch (error: any) {
      errorToast(
        "Error al descargar el Excel. Por favor, intente nuevamente.",
        error.message.toString()
      );
    }
  };

  const handlePDFDownload = async () => {
    if (!dateFrom || !dateTo) {
      errorToast("Por favor seleccione un rango de fechas");
      return;
    }

    try {
      await downloadDashboardFile({
        date_from: formatDate(dateFrom),
        date_to: formatDate(dateTo),
        type: dashboardType,
        format: "pdf",
      });
      successToast("Archivo PDF descargado exitosamente");
    } catch (error: any) {
      errorToast(
        "Error al descargar el PDF. Por favor, intente nuevamente.",
        error.message.toString()
      );
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-2 bg-linear-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 text-green-700 hover:text-green-800 transition-all shadow-sm"
            onClick={handleExcelDownload}
            disabled={!dateFrom || !dateTo}
          >
            <Sheet className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Excel</span>
          </Button>
        </TooltipTrigger>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-2 bg-linear-to-r from-red-50 to-rose-50 border-red-200 hover:from-red-100 hover:to-rose-100 hover:border-red-300 text-red-700 hover:text-red-800 transition-all shadow-sm"
            onClick={handlePDFDownload}
            disabled={!dateFrom || !dateTo}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">PDF</span>
          </Button>
        </TooltipTrigger>
      </Tooltip>
    </div>
  );
}
