import { Button } from "@/components/ui/button";
import { FileText, Plus, Sheet } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { STORE_VISITS } from "../lib/storeVisits.constants";
import { Tooltip, TooltipTrigger } from "@radix-ui/react-tooltip";
import { errorToast, successToast } from "@/core/core.function";
import { downloadStoreVisitsFile } from "../lib/storeVisits.actions";

interface StoreVisitsActionsProps {
  dateFrom?: Date;
  dateTo?: Date;
  permissions: {
    canCreate: boolean;
    canExport: boolean;
  };
}

export default function StoreVisitsActions({
  dateFrom,
  dateTo,
  permissions,
}: StoreVisitsActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = STORE_VISITS;

  const formatDate = (date: Date | undefined) => {
    return date ? date.toISOString().split("T")[0] : undefined;
  };

  const handleExcelDownload = async () => {
    try {
      const created_at =
        dateFrom && dateTo
          ? [formatDate(dateFrom), formatDate(dateTo)]
          : undefined;

      await downloadStoreVisitsFile({
        params: { created_at },
      });
      successToast("Archivo Excel descargado exitosamente");
    } catch (error) {
      errorToast("Error al descargar el Excel. Por favor, intente nuevamente.");
    }
  };

  const handlePDFDownload = async () => {
    try {
      const created_at =
        dateFrom && dateTo
          ? [formatDate(dateFrom), formatDate(dateTo)]
          : undefined;

      await downloadStoreVisitsFile({
        params: { format: "pdf", created_at },
      });
      successToast("Archivo PDF descargado exitosamente");
    } catch (error) {
      errorToast("Error al descargar el PDF. Por favor, intente nuevamente.");
    }
  };

  return (
    <ActionsWrapper>
      <div className="flex items-center gap-2">
        {permissions.canExport && (
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  tooltip="Excel"
                  className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 transition-colors"
                  onClick={handleExcelDownload}
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
                  tooltip="PDF"
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 transition-colors"
                  onClick={handlePDFDownload}
                >
                  <FileText className="size-4" />
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </div>
        )}

        {permissions.canCreate && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => router(ROUTE_ADD!)}
          >
            <Plus className="size-4 mr-2" /> Agregar Visita
          </Button>
        )}
      </div>
    </ActionsWrapper>
  );
}
