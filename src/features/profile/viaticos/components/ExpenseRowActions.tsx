"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";
import { ExpenseResource } from "../lib/perDiemRequest.interface";
import { useState } from "react";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { validateExpense, rejectExpense } from "../lib/perDiemRequest.actions";
import { useToast } from "@/hooks/use-toast";

interface ExpenseRowActionsProps {
  expense: ExpenseResource;
  onActionComplete?: () => void;
  module: "gh" | "contabilidad" | "profile";
}

export default function ExpenseRowActions({
  expense,
  onActionComplete,
  module,
}: ExpenseRowActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleValidate = async () => {
    try {
      setIsLoading(true);
      await validateExpense(expense.id);
      toast({
        title: "Gasto validado",
        description: "El gasto ha sido validado exitosamente.",
      });
      onActionComplete?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "No se pudo validar el gasto. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      await rejectExpense(expense.id);
      toast({
        title: "Gasto rechazado",
        description: "El gasto ha sido rechazado exitosamente.",
      });
      onActionComplete?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "No se pudo rechazar el gasto. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {expense.receipt_path && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => window.open(expense.receipt_path, "_blank")}
          title="Ver Comprobante"
        >
          <FileText className="h-4 w-4" />
        </Button>
      )}

      {!expense.validated && module === "contabilidad" && (
        <>
          <ConfirmationDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
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
              2
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
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-red-50"
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
              2
            )} por ${
              expense.expense_type?.name
            }. Esta acción indicará que el gasto no cumple con las políticas o tiene problemas que necesitan corrección.`}
            confirmText="Rechazar Gasto"
            cancelText="Cancelar"
            onConfirm={handleReject}
            variant="destructive"
            icon="danger"
            confirmDisabled={isLoading}
          />
        </>
      )}
    </div>
  );
}
