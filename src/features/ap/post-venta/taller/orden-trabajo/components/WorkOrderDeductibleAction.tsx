import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, ShieldOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { successToast, errorToast, formatMoney } from "@/core/core.function";
import {
  storeWorkOrderDeductible,
  deleteWorkOrderDeductible,
} from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.actions";
import { WorkOrderDeductibleSheet } from "./WorkOrderDeductibleSheet";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import { WorkOrderDeductibleResource } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.interface";
import { WORKER_ORDER_LABOUR } from "@/features/ap/post-venta/taller/orden-trabajo-labor/lib/workOrderLabour.constants";

interface WorkOrderDeductibleActionProps {
  workOrderId: number;
  plate: string;
  deductibles: WorkOrderDeductibleResource[];
  sedeId?: string | number;
  currencyId?: string | number;
  currencySymbol?: string;
  deductibleAmount: number;
  disabled?: boolean;
}

export const WorkOrderDeductibleAction = ({
  workOrderId,
  plate,
  deductibles,
  sedeId,
  currencyId,
  currencySymbol = "S/",
  deductibleAmount,
  disabled,
}: WorkOrderDeductibleActionProps) => {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const hasDeductibles = deductibleAmount > 0 && deductibles.length > 0;

  const invalidateWorkOrder = () => {
    queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });
    // El backend puede insertar/eliminar un item de mano de obra al
    // asociar/quitar el deducible: si la pestaña de mano de obra está
    // montada se refresca sola; si no, solo queda marcada como stale.
    queryClient.invalidateQueries({
      queryKey: [WORKER_ORDER_LABOUR.QUERY_KEY],
    });
  };

  const storeMutation = useMutation({
    mutationFn: (electronicDocumentId: number) =>
      storeWorkOrderDeductible({
        work_order_id: workOrderId,
        electronic_document_id: electronicDocumentId,
      }),
    onSuccess: () => {
      successToast("Deducible asociado exitosamente a la orden de trabajo");
      invalidateWorkOrder();
      setIsSheetOpen(false);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al asociar el deducible",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (deductibleId: number) =>
      deleteWorkOrderDeductible(deductibleId),
    onSuccess: () => {
      successToast("Deducible eliminado exitosamente");
      invalidateWorkOrder();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al eliminar el deducible",
      );
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleSelectDocument = (document: ElectronicDocumentResource) => {
    storeMutation.mutate(document.id);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {hasDeductibles ? (
          <>
            <div className="flex flex-col items-end gap-1 leading-tight">
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-500">Deducible</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 whitespace-nowrap">
                  <ShieldCheck className="h-3 w-3" />
                  {formatMoney(deductibleAmount, 2, currencySymbol)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                {deductibles.map((deductible) => (
                  <div key={deductible.id} className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">
                      {deductible.full_number} · {deductible.cliente_denominacion} (
                      {deductible.cliente_numero_de_documento}) ·{" "}
                      {formatMoney(deductible.total, 2, currencySymbol)}
                    </span>
                    <ConfirmationDialog
                      trigger={
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-5 w-5 shrink-0 text-red-600 hover:text-red-700"
                          disabled={
                            disabled ||
                            (deleteMutation.isPending &&
                              deletingId === deductible.id)
                          }
                          tooltip="Quitar deducible"
                        >
                          <ShieldOff className="h-3 w-3" />
                        </Button>
                      }
                      title="¿Quitar el deducible?"
                      description={`Se eliminará la asociación del comprobante ${deductible.full_number} (${deductible.cliente_denominacion}) como deducible de esta orden de trabajo. Podrás asociar otro comprobante después.`}
                      confirmText="Sí, quitar"
                      cancelText="Cancelar"
                      variant="destructive"
                      icon="danger"
                      onConfirm={() => {
                        setDeletingId(deductible.id);
                        deleteMutation.mutate(deductible.id);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              disabled={disabled || storeMutation.isPending}
              tooltip="Asociar otro deducible"
              onClick={() => setIsSheetOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSheetOpen(true)}
            className="gap-2"
            disabled={disabled || storeMutation.isPending}
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Asociar Deducible</span>
            <span className="sm:hidden">Deducible</span>
          </Button>
        )}
      </div>

      <WorkOrderDeductibleSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        sedeId={sedeId}
        currencyId={currencyId}
        onSelectDocument={handleSelectDocument}
        isSubmitting={storeMutation.isPending}
        plate={plate}
      />
    </>
  );
};
