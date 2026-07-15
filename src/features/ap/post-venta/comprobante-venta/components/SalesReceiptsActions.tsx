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
import { cn } from "@/lib/utils";
import { errorToast, successToast } from "@/core/core.function";
import { useMutation } from "@tanstack/react-query";
import { syncAccountingStatus } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
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
}

export default function SalesReceiptsActions({
  onOtherSalesClick,
  onHistoricalFinalSaleWithAdvanceClick,
  onRegularizeAdvancePaymentClick,
  onRefresh,
  isLoading,
  permissions,
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

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCw
          className={cn("size-4 mr-2", { "animate-spin": isLoading })}
        />
        Actualizar
      </Button>

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
                Factura con Anticipo Histórica de OT
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
