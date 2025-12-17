"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseTypeForm } from "./ExpenseTypeForm";
import {
  useStoreExpenseType,
  useUpdateExpenseType,
  useExpenseType,
} from "../lib/expenseType.hook";
import {
  errorToast,
  successToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/core/core.function";
import { EXPENSE_TYPE } from "../lib/expenseType.constants";

interface ExpenseTypeModalProps {
  id?: number;
  title: string;
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
}

export default function ExpenseTypeModal({
  id,
  title,
  open,
  onClose,
  mode,
}: ExpenseTypeModalProps) {
  const { MODEL } = EXPENSE_TYPE;
  const { data: expenseType } = useExpenseType(id || 0);
  const storeMutation = useStoreExpenseType();
  const updateMutation = useUpdateExpenseType();

  const handleSubmit = async (data: any) => {
    try {
      if (mode === "create") {
        await storeMutation.mutateAsync(data);
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
      } else if (id) {
        await updateMutation.mutateAsync({ id, data });
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
      }
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, mode, msg));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ExpenseTypeForm
          defaultValues={mode === "update" && expenseType ? expenseType : {}}
          onSubmit={handleSubmit}
          isSubmitting={storeMutation.isPending || updateMutation.isPending}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
