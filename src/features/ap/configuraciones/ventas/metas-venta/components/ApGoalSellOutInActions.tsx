import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardMinus, Goal, FileText } from "lucide-react";
import { AP_GOAL_SELL_OUT_IN } from "../lib/apGoalSellOutIn.constants";
import { Tooltip, TooltipTrigger } from "@radix-ui/react-tooltip";
import { downloadApGoalSellOutInReportPdf } from "../lib/apGoalSellOutIn.actions";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { errorToast, successToast } from "@/core/core.function";

interface Props {
  year?: string;
  month?: string;
  permissions: {
    canCreate: boolean;
    canExport: boolean;
  };
}

export default function ApGoalSellOutInActions({
  year,
  month,
  permissions,
}: Props) {
  const router = useNavigate();
  const { ABSOLUTE_ROUTE } = AP_GOAL_SELL_OUT_IN;
  const currentYear = year || new Date().getFullYear().toString();
  const currentMonth = month || (new Date().getMonth() + 1).toString();

  const handlePDFDownload = async () => {
    try {
      await downloadApGoalSellOutInReportPdf({
        params: {
          year: currentYear,
          month: currentMonth,
        },
      });
      successToast("No hay datos para generar el reporte PDF");
    } catch (error: any) {
      errorToast(
        "Error al descargar el PDF. Por favor, intente nuevamente.",
        error.response.data?.message?.toString()
      );
    }
  };

  return (
    <ActionsWrapper>
      <div className="flex items-center gap-2">
        {permissions.canCreate && (
          <>
            <div className="flex items-center gap-1 bg-gray-50 rounded-lg border">
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

            <Button
              size="sm"
              className="ml-auto"
              onClick={() =>
                router(
                  `${ABSOLUTE_ROUTE}/resumen?year=${currentYear}&month=${currentMonth}`
                )
              }
            >
              <ClipboardMinus className="size-4 mr-2" /> Resumen
            </Button>
          </>
        )}

        {permissions.canCreate && (
          <Button
            size="sm"
            className="ml-auto"
            onClick={() => router(`${ABSOLUTE_ROUTE}/gestionar`)}
          >
            <Goal className="size-4 mr-2" /> Gestionar Meta
          </Button>
        )}
      </div>
    </ActionsWrapper>
  );
}
