"use client";

import { Button } from "@/components/ui/button";
import {
  BookCheck,
  Files,
  HandCoins,
  History,
  Plus,
  RefreshCw,
} from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ExportButtons from "@/shared/components/ExportButtons";
import { cn } from "@/lib/utils";
import { errorToast, successToast } from "@/core/core.function";
import { useMutation } from "@tanstack/react-query";
import { syncAccountingStatus } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import { downloadReport } from "@/shared/lib/reports/reports.actions";
import { POST_VENTA_REPORTS_ROUTES } from "@/features/ap/post-venta/reportes/lib/reportsRoutes.constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SalesReceiptsActionsProps {
  onOtherSalesClick?: () => void;
  onHistoricalFinalSaleWithAdvanceClick?: () => void;
  onRegularizeAdvancePaymentClick?: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  permissions?: {
    canRegularizationAdvances: boolean;
    canInvoiceOtherSales: boolean;
  };
  // Filtros tomados de SalesReceiptsOptions para acotar la exportación.
  filters?: Record<string, unknown>;
}

export default function SalesReceiptsActions({
  onOtherSalesClick,
  onHistoricalFinalSaleWithAdvanceClick,
  onRegularizeAdvancePaymentClick,
  onRefresh,
  isLoading,
  permissions,
  filters,
}: SalesReceiptsActionsProps) {
  const syncAccountingMutation = useMutation({
    mutationFn: syncAccountingStatus,
    onSuccess: () => {
      successToast("Contabilizaciones sincronizadas correctamente");
      onRefresh();
    },
    onError: () => {
      errorToast("Error al consultar contabilizaciones");
    },
  });

  const getExportParams = (format: string) => {
    const params: Record<string, unknown> = { format };

    Object.entries(filters ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      params[key] = value;
    });

    return params;
  };

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCw
          className={cn("size-4 mr-2", { "animate-spin": isLoading })}
        />
        Actualizar
      </Button>

      <ExportButtons
        variant="separate"
        onExcelDownload={() =>
          downloadReport(
            POST_VENTA_REPORTS_ROUTES.ELECTRONIC_DOCUMENTS_DETAILED_EXPORT,
            getExportParams("excel"),
            "reporte_detallado_documentos_electronicos",
          )
        }
      />

      <Button
        size="sm"
        variant="outline"
        onClick={() => syncAccountingMutation.mutate()}
        disabled={syncAccountingMutation.isPending}
      >
        <BookCheck
          className={cn("size-4 mr-2", {
            "animate-pulse": syncAccountingMutation.isPending,
          })}
        />
        Contabilizaciones
      </Button>

      {(permissions?.canInvoiceOtherSales ||
        permissions?.canRegularizationAdvances) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus className="size-4 mr-2" />
              Nuevo Comprobante
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {permissions?.canInvoiceOtherSales && (
              <DropdownMenuItem onClick={onOtherSalesClick}>
                <Files className="size-4 mr-2" />
                Otras Ventas
              </DropdownMenuItem>
            )}

            {permissions?.canInvoiceOtherSales && (
              <DropdownMenuItem onClick={onHistoricalFinalSaleWithAdvanceClick}>
                <History className="size-4 mr-2" />
                Comprobante con Anticipo Histórico OT
              </DropdownMenuItem>
            )}

            {permissions?.canRegularizationAdvances && (
              <DropdownMenuItem onClick={onRegularizeAdvancePaymentClick}>
                <HandCoins className="size-4 mr-2" />
                Regularización de Anticipos
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </ActionsWrapper>
  );
}
