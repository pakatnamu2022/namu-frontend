"use client";

import { useState } from "react";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Target,
  DollarSign,
  Plus,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import ExpensesTable from "./ExpensesTable";
import ExpenseForm from "./ExpenseForm";
import { ExpenseSchema } from "../lib/expense.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeExpense } from "../lib/perDiemRequest.actions";
import { PER_DIEM_REQUEST } from "../lib/perDiemRequest.constants";
import { toast } from "sonner";

interface PerDiemRequestDetailProps {
  request: PerDiemRequestResource;
  open: boolean;
  onClose: () => void;
}

export default function PerDiemRequestDetail({
  request,
  open,
  onClose,
}: PerDiemRequestDetailProps) {
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const storeMutation = useMutation({
    mutationFn: (formData: FormData) => storeExpense(request.id, formData),
    onSuccess: () => {
      toast.success("Gasto agregado exitosamente");
      setIsExpenseSheetOpen(false);
      queryClient.invalidateQueries({ queryKey: [PER_DIEM_REQUEST.QUERY_KEY] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al agregar el gasto"
      );
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
    formData.append("receipt_number", data.receipt_number);
    formData.append("expense_type_id", data.expense_type_id.toString());

    if (data.notes) {
      formData.append("notes", data.notes);
    }

    if (data.receipt_file) {
      formData.append("receipt_file", data.receipt_file);
    }

    storeMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      icon: React.ReactNode;
    }> = {
      pending: {
        label: "Pendiente",
        variant: "outline",
        icon: <Clock className="h-3 w-3" />
      },
      approved: {
        label: "Aprobada",
        variant: "default",
        icon: <CheckCircle2 className="h-3 w-3" />
      },
      rejected: {
        label: "Rechazada",
        variant: "destructive",
        icon: <XCircle className="h-3 w-3" />
      },
      paid: {
        label: "Pagada",
        variant: "secondary",
        icon: <CheckCircle2 className="h-3 w-3" />
      },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "outline",
      icon: null
    };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  return (
    <>
      <GeneralSheet
        open={open}
        onClose={onClose}
        title={request.code}
        subtitle="Detalle de Solicitud de Viáticos"
        icon="Receipt"
        size="4xl"
      >
        <div className="h-full overflow-y-auto space-y-6 pb-20">
          {/* Status and Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Información General</CardTitle>
                  <CardDescription>Detalles de la solicitud</CardDescription>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Fechas</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(request.start_date), "dd 'de' MMMM, yyyy", { locale: es })} -{" "}
                    {format(new Date(request.end_date), "dd 'de' MMMM, yyyy", { locale: es })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {request.days_count} {request.days_count === 1 ? "día" : "días"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Destino</p>
                  <p className="text-sm text-muted-foreground">{request.destination}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Propósito</p>
                  <p className="text-sm text-muted-foreground">{request.purpose}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Categoría</p>
                  <p className="text-sm text-muted-foreground">{request.category.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen Financiero</CardTitle>
              <CardDescription>Montos y saldos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Presupuesto Total</p>
                  <p className="text-2xl font-bold">S/ {request.total_budget.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Gastado</p>
                  <p className="text-2xl font-bold text-orange-600">
                    S/ {request.total_spent.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Por Devolver</p>
                  <p className="text-2xl font-bold text-green-600">
                    S/ {request.balance_to_return.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Método de Pago</p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      Efectivo: <span className="font-semibold">S/ {request.cash_amount.toFixed(2)}</span>
                    </p>
                    <p className="text-sm">
                      Transferencia: <span className="font-semibold">S/ {request.transfer_amount.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos Registrados</CardTitle>
              <CardDescription>
                Lista de todos los gastos de esta solicitud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpensesTable expenses={request.expenses || []} />
            </CardContent>
          </Card>
        </div>

        {/* Floating Action Button */}
        <Button
          onClick={() => setIsExpenseSheetOpen(true)}
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </GeneralSheet>

      {/* Add Expense Sheet */}
      <GeneralSheet
        open={isExpenseSheetOpen}
        onClose={() => setIsExpenseSheetOpen(false)}
        title="Agregar Gasto"
        subtitle="Registra un nuevo gasto para esta solicitud"
        icon="Plus"
        size="2xl"
      >
        <div className="h-full overflow-y-auto">
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
