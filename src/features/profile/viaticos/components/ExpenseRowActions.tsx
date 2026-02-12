"use client";

import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { ExpenseResource } from "../lib/perDiemRequest.interface";
import { useState } from "react";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { validateExpense, rejectExpense } from "../lib/perDiemRequest.actions";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useDeletePerDiemExpense } from "../lib/perDiemExpense.hook";
import { useQueryClient } from "@tanstack/react-query";
import { PER_DIEM_REQUEST } from "../lib/perDiemRequest.constants";
import { errorToast, successToast, warningToast } from "@/core/core.function";

interface ExpenseRowActionsProps {
  expense: ExpenseResource;
  onActionComplete?: () => void;
  module: "gh" | "contabilidad" | "profile";
  requestId?: number;
  requestStatus?: string;
}

export default function ExpenseRowActions({
  expense,
  onActionComplete,
  module,
  requestId,
  requestStatus,
}: ExpenseRowActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { ABSOLUTE_ROUTE: PER_DIEM_REQUEST_ROUTE, QUERY_KEY } =
    PER_DIEM_REQUEST;
  const deleteExpenseMutation = useDeletePerDiemExpense(requestId || 0, {
    onSuccess: () => {
      onActionComplete?.();
    },
  });

  const handleValidate = async () => {
    try {
      setIsLoading(true);
      await validateExpense(expense.id);
      successToast("Gasto validado", "El gasto ha sido validado exitosamente.");
      // Invalidar queries para refrescar los datos
      if (requestId) {
        await queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, requestId],
        });
      }
      onActionComplete?.();
    } catch (error: any) {
      errorToast(
        "Error",
        error.response?.data?.message ||
          "No se pudo validar el gasto. Inténtalo de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      warningToast("Error", "Debes ingresar un motivo de rechazo.");
      return;
    }

    try {
      setIsLoading(true);
      await rejectExpense(expense.id, rejectionReason);
      warningToast(
        "Gasto rechazado",
        "El gasto ha sido rechazado exitosamente.",
      );

      // Invalidar queries para refrescar los datos
      if (requestId) {
        await queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, requestId],
        });
      }
      setRejectionReason("");
      onActionComplete?.();
    } catch (error: any) {
      errorToast(
        "Error",
        error.response?.data?.message ||
          "No se pudo rechazar el gasto. Inténtalo de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (requestId) {
      navigate(
        `${PER_DIEM_REQUEST_ROUTE}/${requestId}/gastos/actualizar/${expense.id}`,
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExpenseMutation.mutateAsync(expense.id);
    } catch (error) {
      // El error ya está manejado por el hook
    }
  };

  const canEdit = module === "profile" && requestStatus === "in_progress";
  const canDelete = module === "profile" && requestStatus === "in_progress";

  return (
    <div className="flex items-center gap-1">
      {expense.receipt_path && (
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => window.open(expense.receipt_path, "_blank")}
          title="Ver Comprobante"
        >
          <FileText className="h-4 w-4" />
        </Button>
      )}

      {canEdit && (
        <Button
          variant="outline"
          size="icon-xs"
          onClick={handleEdit}
          title="Editar Gasto"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      {canDelete && (
        <ConfirmationDialog
          trigger={
            <Button
              variant="outline"
              size="icon-xs"
              className="text-destructive hover:bg-red-50"
              disabled={deleteExpenseMutation.isPending}
              title="Eliminar Gasto"
            >
              {deleteExpenseMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          }
          title="¿Eliminar este gasto?"
          description={`Estás a punto de eliminar el gasto de S/ ${expense.receipt_amount.toFixed(
            2,
          )} por ${
            expense.expense_type?.name
          }. Esta acción no se puede deshacer.`}
          confirmText="Eliminar Gasto"
          cancelText="Cancelar"
          onConfirm={handleDelete}
          variant="destructive"
          icon="danger"
          confirmDisabled={deleteExpenseMutation.isPending}
        />
      )}

      {!expense.validated && !expense.rejected && module === "contabilidad" && (
        <>
          <ConfirmationDialog
            trigger={
              <Button
                variant="outline"
                size="icon-xs"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                disabled={isLoading}
                title="Validar Gasto"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </Button>
            }
            title="¿Validar este gasto?"
            description={`Estás a punto de validar el gasto de S/ ${expense.receipt_amount.toFixed(
              2,
            )} por ${
              expense.expense_type?.name
            }. Esta acción confirmará que el gasto es correcto y cumple con las políticas de la empresa.`}
            confirmText="Validar Gasto"
            cancelText="Cancelar"
            onConfirm={handleValidate}
            variant="default"
            icon="info"
            confirmDisabled={isLoading}
          />

          <ConfirmationDialog
            trigger={
              <Button
                variant="outline"
                size="icon-xs"
                className="text-destructive hover:bg-red-50"
                disabled={isLoading}
                title="Rechazar Gasto"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
              </Button>
            }
            title="¿Rechazar este gasto?"
            description={`Estás a punto de rechazar el gasto de S/ ${expense.receipt_amount.toFixed(
              2,
            )} por ${
              expense.expense_type?.name
            }. Esta acción indicará que el gasto no cumple con las políticas o tiene problemas que necesitan corrección.`}
            confirmText="Rechazar Gasto"
            cancelText="Cancelar"
            onConfirm={handleReject}
            variant="destructive"
            icon="danger"
            confirmDisabled={isLoading || !rejectionReason.trim()}
          >
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-sm font-medium">
                Motivo del rechazo *
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explica por qué se rechaza este gasto..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
                disabled={isLoading}
              />
            </div>
          </ConfirmationDialog>
        </>
      )}
    </div>
  );
}
