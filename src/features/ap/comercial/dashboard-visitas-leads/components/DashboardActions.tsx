import { errorToast, successToast } from "@/core/core.function";
import { downloadDashboardFile } from "../lib/dashboard.actions";
import ExportButtons from "@/shared/components/ExportButtons";

interface DashboardActionsProps {
  dateFrom?: Date;
  dateTo?: Date;
  dashboardType: "VISITA" | "LEADS";
  variant?: "grouped" | "separate";
}

export default function DashboardActions({
  dateFrom,
  dateTo,
  dashboardType,
  variant = "grouped",
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
        error.response.data?.message?.toString()
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
        error.response.data?.message?.toString()
      );
    }
  };

  return (
    <ExportButtons
      onExcelDownload={handleExcelDownload}
      onPdfDownload={handlePDFDownload}
      disableExcel={!dateFrom || !dateTo}
      disablePdf={!dateFrom || !dateTo}
      variant={variant}
    />
  );
}
