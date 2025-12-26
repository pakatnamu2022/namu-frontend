"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  FileText,
  Loader2,
} from "lucide-react";
import { ExpenseResource } from "../lib/perDiemRequest.interface";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { validateExpense, rejectExpense } from "../lib/perDiemRequest.actions";
import { useToast } from "@/hooks/use-toast";

interface ExpenseRowActionsProps {
  expense: ExpenseResource;
  onActionComplete?: () => void;
}

export default function ExpenseRowActions({
  expense,
  onActionComplete,
}: ExpenseRowActionsProps) {
  const [isValidateDialogOpen, setIsValidateDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
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
      setIsValidateDialogOpen(false);
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
      setIsRejectDialogOpen(false);
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {expense.receipt_path && (
            <>
              <DropdownMenuItem
                onClick={() => window.open(expense.receipt_path, "_blank")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Ver Comprobante
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {!expense.validated && (
            <>
              <DropdownMenuItem
                onClick={() => setIsValidateDialogOpen(true)}
                className="text-green-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Validar Gasto
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsRejectDialogOpen(true)}
                className="text-destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rechazar Gasto
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Validación */}
      <AlertDialog
        open={isValidateDialogOpen}
        onOpenChange={setIsValidateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Validar este gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de validar el gasto de{" "}
              <strong>S/ {expense.receipt_amount.toFixed(2)}</strong> por{" "}
              <strong>{expense.expense_type?.name}</strong>. Esta acción
              confirmará que el gasto es correcto y cumple con las políticas de
              la empresa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleValidate}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Validar Gasto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Rechazo */}
      <AlertDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Rechazar este gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de rechazar el gasto de{" "}
              <strong>S/ {expense.receipt_amount.toFixed(2)}</strong> por{" "}
              <strong>{expense.expense_type?.name}</strong>. Esta acción
              indicará que el gasto no cumple con las políticas o tiene
              problemas que necesitan corrección.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rechazar Gasto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
