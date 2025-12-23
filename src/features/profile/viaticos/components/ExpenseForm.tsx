"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, ExpenseSchema } from "../lib/expense.schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { Option } from "@/core/core.interface";
import { useActiveExpenseTypes } from "@/features/gp/gestionhumana/viaticos/tipo-gasto/lib/expenseType.hook";
import { getRemainingBudget } from "../lib/perDiemExpense.actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

interface ExpenseFormProps {
  requestId: number;
  defaultValues?: Partial<ExpenseSchema>;
  onSubmit: (data: ExpenseSchema) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  mode?: "create" | "update";
}

export default function ExpenseForm({
  requestId,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
  mode = "create",
}: ExpenseFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remainingBudget, setRemainingBudget] = useState<number | null>(null);
  const [isLoadingBudget, setIsLoadingBudget] = useState(false);
  const [budgetInfo, setBudgetInfo] = useState<{
    daily_amount: string;
    total_spent_on_date: number;
    is_over_budget: boolean;
  } | null>(null);

  // Obtener tipos de gasto activos del backend
  const { data: expenseTypes, isLoading: isLoadingExpenseTypes } =
    useActiveExpenseTypes();

  const form = useForm<ExpenseSchema>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      receipt_amount: 0,
      company_amount: 0,
      employee_amount: 0,
      receipt_type: "invoice",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const receiptAmount = form.watch("receipt_amount");
  const companyAmount = form.watch("company_amount");
  const receiptType = form.watch("receipt_type");
  const expenseDate = form.watch("expense_date");
  const expenseTypeId = form.watch("expense_type_id");

  // Auto-calculate employee amount
  const handleAmountChange = (
    newReceiptAmount: number,
    newCompanyAmount: number
  ) => {
    const employeeAmount = Math.abs(newReceiptAmount - newCompanyAmount);
    form.setValue("employee_amount", Math.max(0, employeeAmount));
  };

  // Limpiar número de comprobante cuando el tipo es "Sin Comprobante"
  useEffect(() => {
    if (receiptType === "no_receipt") {
      form.setValue("receipt_number", "");
    }
  }, [receiptType, form]);

  // Consultar presupuesto restante cuando cambien la fecha y el tipo de gasto
  useEffect(() => {
    const fetchRemainingBudget = async () => {
      if (expenseDate && expenseTypeId) {
        setIsLoadingBudget(true);
        try {
          const formattedDate = format(expenseDate, "yyyy-MM-dd");
          const response = await getRemainingBudget(
            requestId,
            formattedDate,
            parseInt(expenseTypeId)
          );

          setRemainingBudget(response.data.remaining_budget);
          setBudgetInfo({
            daily_amount: response.data.daily_amount,
            total_spent_on_date: response.data.total_spent_on_date,
            is_over_budget: response.data.is_over_budget,
          });
        } catch (error) {
          console.error("Error al obtener presupuesto restante:", error);
          setRemainingBudget(null);
          setBudgetInfo(null);
        } finally {
          setIsLoadingBudget(false);
        }
      } else {
        setRemainingBudget(null);
        setBudgetInfo(null);
      }
    };

    fetchRemainingBudget();
  }, [expenseDate, expenseTypeId, requestId]);

  // Convertir los tipos de gasto a opciones para el select
  const expenseTypeOptions: Option[] =
    expenseTypes?.map((type) => ({
      value: type.id.toString(),
      label: type.name,
      description: type.parent ? type.parent.name : undefined,
    })) || [];

  const receiptTypeOptions: Option[] = [
    { value: "invoice", label: "Factura" },
    { value: "ticket", label: "Boleta" },
    { value: "no_receipt", label: "Sin Comprobante" },
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6"
      >
        {/* Información General */}
        <div className="col-span-full space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DatePickerFormField
              control={form.control}
              name="expense_date"
              label="Fecha del Gasto"
              placeholder="Selecciona una fecha"
              dateFormat="dd/MM/yyyy"
              captionLayout="dropdown"
            />

            <FormSelect
              name="expense_type_id"
              label="Tipo de Gasto"
              placeholder="Selecciona un tipo"
              options={expenseTypeOptions}
              control={form.control}
              required
              isLoadingOptions={isLoadingExpenseTypes}
            />
          </div>

          {/* Información de Presupuesto Restante */}
          {expenseDate && expenseTypeId && (
            <div className="mt-4">
              {isLoadingBudget ? (
                <Alert>
                  <Loader className="h-4 w-4 animate-spin" />
                  <AlertTitle>Consultando presupuesto...</AlertTitle>
                  <AlertDescription>
                    Obteniendo información del presupuesto disponible
                  </AlertDescription>
                </Alert>
              ) : remainingBudget !== null && budgetInfo ? (
                <Alert
                  variant={budgetInfo.is_over_budget ? "destructive" : "default"}
                  className={
                    !budgetInfo.is_over_budget
                      ? "border-green-500 bg-green-50 text-green-900"
                      : ""
                  }
                >
                  {budgetInfo.is_over_budget ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  <AlertTitle>
                    {budgetInfo.is_over_budget
                      ? "⚠️ Presupuesto Excedido"
                      : "Presupuesto Disponible"}
                  </AlertTitle>
                  <AlertDescription>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Monto Diario:</span>
                        <span>S/ {budgetInfo.daily_amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Gastado en esta fecha:</span>
                        <span>S/ {budgetInfo.total_spent_on_date.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span className="font-bold">Presupuesto Restante:</span>
                        <span
                          className={`font-bold ${
                            budgetInfo.is_over_budget
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          S/ {remainingBudget.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
          )}

          {/* Montos */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormInput
                name="receipt_amount"
                label="Monto Comprobante"
                type="number"
                step="0.01"
                placeholder="0.00"
                control={form.control}
                required
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  form.setValue("receipt_amount", value);
                  handleAmountChange(value, companyAmount);
                }}
                description="Monto total del comprobante de gasto"
              />

              <FormInput
                name="company_amount"
                label="Monto Empresa"
                type="number"
                step="0.01"
                placeholder="0.00"
                control={form.control}
                required
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  form.setValue("company_amount", value);
                  handleAmountChange(receiptAmount, value);
                }}
                description="Monto cubierto por la empresa"
              />

              <FormInput
                name="employee_amount"
                label="Monto Empleado"
                type="number"
                step="0.01"
                placeholder="0.00"
                control={form.control}
                disabled
                className="bg-muted"
                description="Calculado automáticamente"
              />
            </div>
          </div>

          {/* Información del Comprobante */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                name="receipt_type"
                label="Tipo de Comprobante"
                placeholder="Selecciona un tipo"
                options={receiptTypeOptions}
                control={form.control}
                required
              />

              {(receiptType === "invoice" || receiptType === "ticket") && (
                <FormInput
                  name="receipt_number"
                  label="Número de Comprobante"
                  placeholder="B001-00000001"
                  control={form.control}
                  required
                />
              )}

              <FormField
                control={form.control}
                name="receipt_file"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-xs md:text-sm">
                      Archivo del Comprobante
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            type="file"
                            accept="application/pdf,image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedFile(file);
                                onChange(file);
                              }
                            }}
                            className="pl-10 h-8 md:h-10 text-xs md:text-sm"
                            {...field}
                            value={undefined}
                          />
                          <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </div>
                        {selectedFile && (
                          <div className="flex items-center gap-2 p-2 sm:p-3 bg-muted rounded-md">
                            <FileText className="h-4 w-4 shrink-0 text-primary" />
                            <span className="text-xs sm:text-sm truncate flex-1">
                              {selectedFile.name}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Tamaño máximo: 5MB. Archivos PDF o imágenes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-xs md:text-sm">
                      Notas (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones adicionales..."
                        className="resize-none min-h-20 text-xs md:text-sm"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full sm:justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
            className="w-full sm:w-auto"
          >
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
              ? "Guardar Gasto"
              : "Actualizar Gasto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
