import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, ShieldOff } from "lucide-react";
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

interface WorkOrderDeductibleActionProps {
  workOrderId: number;
  plate: string;
  deductible: WorkOrderDeductibleResource | null;
  sedeId?: string | number;
  currencyId?: string | number;
  currencySymbol?: string;
  deductibleAmount: number;
  disabled?: boolean;
}

export const WorkOrderDeductibleAction = ({
  workOrderId,
  plate,
  deductible,
  sedeId,
  currencyId,
  currencySymbol = "S/",
  deductibleAmount,
  disabled,
}: WorkOrderDeductibleActionProps) => {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const hasDeductible = deductibleAmount > 0 && !!deductible;

  const invalidateWorkOrder = () =>
    queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });

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
    mutationFn: () => deleteWorkOrderDeductible(deductible!.id),
    onSuccess: () => {
      successToast("Deducible eliminado exitosamente");
      invalidateWorkOrder();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al eliminar el deducible",
      );
    },
  });

  const handleSelectDocument = (document: ElectronicDocumentResource) => {
    storeMutation.mutate(document.id);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {hasDeductible ? (
          <>
            <div className="flex flex-col items-end leading-tight">
              <p className="text-xs text-gray-500">Deducible</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 whitespace-nowrap">
                <ShieldCheck className="h-3 w-3" />
                {formatMoney(deductibleAmount, 2, currencySymbol)}
              </span>
              {deductible && (
                <span className="text-[11px] text-gray-500 whitespace-nowrap">
                  {deductible.full_number} · {deductible.cliente_denominacion} (
                  {deductible.cliente_numero_de_documento})
                </span>
              )}
            </div>
            <ConfirmationDialog
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 text-red-600 hover:text-red-700"
                  disabled={disabled || deleteMutation.isPending}
                  tooltip="Quitar deducible"
                >
                  <ShieldOff className="h-4 w-4" />
                </Button>
              }
              title="¿Quitar el deducible?"
              description={
                deductible
                  ? `Se eliminará la asociación del comprobante ${deductible.full_number} (${deductible.cliente_denominacion}) como deducible de esta orden de trabajo. Podrás asociar otro comprobante después.`
                  : "Se eliminará la asociación del comprobante como deducible de esta orden de trabajo. Podrás asociar otro comprobante después."
              }
              confirmText="Sí, quitar"
              cancelText="Cancelar"
              variant="destructive"
              icon="danger"
              onConfirm={() => deleteMutation.mutate()}
            />
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
