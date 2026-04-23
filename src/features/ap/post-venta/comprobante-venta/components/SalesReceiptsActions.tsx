"use client";

import { Button } from "@/components/ui/button";
import { BookCheck, Files, RefreshCw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { cn } from "@/lib/utils";
import { errorToast, successToast } from "@/core/core.function";
import { useMutation } from "@tanstack/react-query";
import { syncAccountingStatus } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";

interface SalesReceiptsActionsProps {
  onOtherSalesClick?: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function SalesReceiptsActions({
  onOtherSalesClick,
  onRefresh,
  isLoading,
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

      <Button size="sm" variant="default" onClick={onOtherSalesClick}>
        <Files className="size-4 mr-2" />
        Otras Ventas
      </Button>
    </ActionsWrapper>
  );
}
