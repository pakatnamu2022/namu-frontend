"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plane, X } from "lucide-react";
import FlightTicketExpenseForm from "./FlightTicketExpenseForm";
import { ExpenseSchema } from "../lib/expense.schema";
import {
  useCreatePerDiemExpense,
  useFlightTicketExpenseTypes,
} from "../lib/perDiemExpense.hook";
import { expenseSchemaToFormData } from "../lib/perDiemExpense.utils";
import { errorToast } from "@/core/core.function";

interface AddFlightTicketModalProps {
  requestId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  startDate?: Date;
  endDate?: Date;
  currentExpensesCount: number;
}

export default function AddFlightTicketModal({
  requestId,
  open,
  onOpenChange,
  onSuccess,
  startDate,
  endDate,
  currentExpensesCount,
}: AddFlightTicketModalProps) {
  const { data: flightTicketTypes, isLoading: isLoadingTypes } =
    useFlightTicketExpenseTypes(requestId);

  const { mutate, isPending } = useCreatePerDiemExpense(requestId, {
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const handleSubmit = (data: ExpenseSchema) => {
    // Validar que no se exceda el máximo de 2 gastos
    if (currentExpensesCount >= 2) {
      errorToast("Solo puedes agregar hasta 2 pasajes aéreos");
      return;
    }

    const formData = expenseSchemaToFormData(data);
    mutate(formData);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-blue-600" />
              <DialogTitle>Agregar Pasaje Aéreo</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Puedes agregar hasta 2 pasajes aéreos ({currentExpensesCount}/2
            agregados)
          </p>
        </DialogHeader>

        {isLoadingTypes ? (
          <div className="py-8 text-center text-muted-foreground">
            Cargando tipos de gasto...
          </div>
        ) : !flightTicketTypes || flightTicketTypes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No hay tipos de gasto de boletos aéreos disponibles para esta
            solicitud.
          </div>
        ) : (
          <FlightTicketExpenseForm
            flightTicketTypes={flightTicketTypes}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
            onCancel={handleCancel}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
