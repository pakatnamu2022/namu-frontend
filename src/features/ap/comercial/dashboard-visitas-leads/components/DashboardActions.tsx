import { Button } from "@/components/ui/button";
import { FileText, Sheet } from "lucide-react";
import { Tooltip, TooltipTrigger } from "@radix-ui/react-tooltip";
import { errorToast, successToast } from "@/src/core/core.function";
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
    } catch (error) {
      errorToast("Error al descargar el Excel. Por favor, intente nuevamente.");
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
    } catch (error) {
      errorToast("Error al descargar el PDF. Por favor, intente nuevamente.");
    }
  };

  return (
    <div className="flex items-center gap-1 bg-gray-50 rounded-lg border">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            tooltip="Exportar a Excel"
            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 transition-colors"
            onClick={handleExcelDownload}
            disabled={!dateFrom || !dateTo}
          >
            <Sheet className="size-4" />
          </Button>
        </TooltipTrigger>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            tooltip="Exportar a PDF"
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 transition-colors"
            onClick={handlePDFDownload}
            disabled={!dateFrom || !dateTo}
          >
            <FileText className="size-4" />
          </Button>
        </TooltipTrigger>
      </Tooltip>
    </div>
  );
}
