"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import ExpenseForm from "./ExpenseForm";
import { ExpenseSchema } from "../lib/expense.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeExpense } from "../lib/perDiemRequest.actions";
import { PER_DIEM_REQUEST } from "../lib/perDiemRequest.constants";
import { toast } from "sonner";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface PerDiemRequestActionsProps {
  requestId: number;
  onExpenseAdded?: () => void;
}

export default function PerDiemRequestActions2({
  requestId,
  onExpenseAdded,
}: PerDiemRequestActionsProps) {
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const storeMutation = useMutation({
    mutationFn: (formData: FormData) => storeExpense(requestId, formData),
    onSuccess: () => {
      toast.success("Gasto agregado exitosamente");
      setIsExpenseSheetOpen(false);
      queryClient.invalidateQueries({ queryKey: [PER_DIEM_REQUEST.QUERY_KEY] });
      onExpenseAdded?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al agregar el gasto");
    },
  });

  const handleExpenseSubmit = (data: ExpenseSchema) => {
    const formData = new FormData();

    formData.append("expense_date", format(data.expense_date, "yyyy-MM-dd"));
    formData.append("concept", data.concept);
    formData.append("receipt_amount", data.receipt_amount.toString());
    formData.append("company_amount", data.company_amount.toString());
    formData.append("employee_amount", data.employee_amount.toString());
    formData.append("receipt_type", data.receipt_type);
    formData.append("expense_type_id", data.expense_type_id.toString());

    if (data.receipt_number) {
      formData.append("receipt_number", data.receipt_number);
    }

    if (data.notes) {
      formData.append("notes", data.notes);
    }

    if (data.receipt_file) {
      formData.append("receipt_file", data.receipt_file);
    }

    storeMutation.mutate(formData);
  };

  const isMobile = useIsMobile();

  return (
    <>
      {/* Desktop Button - Normal button */}
      <Button
        onClick={() => setIsExpenseSheetOpen(true)}
        className="hidden md:flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Nuevo Gasto
      </Button>

      {/* Mobile FAB - Rounded md, not full */}
      <Button
        onClick={() => setIsExpenseSheetOpen(true)}
        className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-md shadow-lg z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Expense Sheet */}
      <GeneralSheet
        open={isExpenseSheetOpen}
        onClose={() => setIsExpenseSheetOpen(false)}
        title="Agregar Gasto"
        subtitle="Registra un nuevo gasto para esta solicitud"
        icon="Plus"
        size="2xl"
        type={isMobile ? "mobile" : "default"}
      >
        <div className="h-full px-2 overflow-y-auto">
          <ExpenseForm
            onSubmit={handleExpenseSubmit}
            isSubmitting={storeMutation.isPending}
            onCancel={() => setIsExpenseSheetOpen(false)}
          />
        </div>
      </GeneralSheet>
    </>
  );
}
