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
import { Loader, Upload, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { Option } from "@/core/core.interface";
import { useAvailableExpenseTypes } from "../lib/perDiemExpense.hook";

interface ExpenseFormProps {
  requestId: number;
  defaultValues?: Partial<ExpenseSchema>;
  onSubmit: (data: ExpenseSchema) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  mode?: "create" | "update";
  startDate?: Date;
  endDate?: Date;
}

export default function ExpenseForm({
  requestId,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
  mode = "create",
  startDate,
  endDate,
}: ExpenseFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Obtener tipos de gasto disponibles para esta solicitud de viáticos
  const { data: expenseTypes, isLoading: isLoadingExpenseTypes } =
    useAvailableExpenseTypes(requestId);

  const form = useForm<ExpenseSchema>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      receipt_amount: 0,
      receipt_type: "invoice",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const receiptType = form.watch("receipt_type");
  const expenseTypeId = form.watch("expense_type_id");

  // Establecer el tipo de comprobante según el requires_receipt del tipo de gasto
  useEffect(() => {
    if (expenseTypeId && expenseTypes) {
      const selectedExpenseType = expenseTypes.find(
        (type) => type.id.toString() === expenseTypeId
      );

      if (selectedExpenseType) {
        const newReceiptType = selectedExpenseType.requires_receipt
          ? "invoice"
          : "no_receipt";

        // Solo actualizar si el valor actual es diferente
        if (form.getValues("receipt_type") !== newReceiptType) {
          form.setValue("receipt_type", newReceiptType);
        }
      }
    }
  }, [expenseTypeId, expenseTypes, form]);

  // Limpiar número de comprobante y archivo cuando el tipo es "Sin Comprobante"
  useEffect(() => {
    if (receiptType === "no_receipt") {
      form.setValue("receipt_number", "");
      form.setValue("receipt_file", undefined);
      setSelectedFile(null);
    }
  }, [receiptType, form]);

  // Convertir los tipos de gasto a opciones para el select
  const expenseTypeOptions: Option[] =
    expenseTypes?.map((type) => ({
      value: type.id.toString(),
      label: type.name,
      description: type.parent ? type.parent.name : undefined,
    })) || [];

  const receiptTypeOptions: Option[] = [
    { value: "invoice", label: "Factura" },
    // { value: "ticket", label: "Boleta" },
    { value: "no_receipt", label: "Sin Comprobante" },
  ];

  // Deshabilitar fechas fuera del rango de la solicitud de viáticos
  const disabledDates = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date < startDate || date > endDate;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6"
      >
        {/* Información General */}
        <div className="col-span-full space-y-6">
          {/* Fecha y Tipo de Gasto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePickerFormField
              control={form.control}
              name="expense_date"
              label="Fecha del Gasto"
              placeholder="Selecciona una fecha"
              dateFormat="dd/MM/yyyy"
              captionLayout="dropdown"
              description="Fecha en que se realizó el gasto"
              disabledRange={disabledDates}
            />

            <FormSelect
              name="expense_type_id"
              label="Tipo de Gasto"
              placeholder="Selecciona un tipo"
              options={expenseTypeOptions}
              control={form.control}
              description="Categoría del gasto realizado"
              required
              isLoadingOptions={isLoadingExpenseTypes}
            />
          </div>

          {/* Detalles del Gasto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="receipt_amount"
              label="Monto del Comprobante"
              type="number"
              step="0.01"
              placeholder="0.00"
              control={form.control}
              required
              description="Monto total del comprobante de gasto"
            />

            <FormSelect
              name="receipt_type"
              label="Tipo de Comprobante"
              placeholder="Selecciona un tipo"
              description="Se establece automáticamente según el tipo de gasto"
              options={receiptTypeOptions}
              control={form.control}
              required
              disabled
            />

            {(receiptType === "invoice" || receiptType === "ticket") && (
              <FormInput
                name="receipt_number"
                label="Número de Comprobante"
                placeholder="B001-00000001"
                description="Número del comprobante de gasto"
                control={form.control}
                required
              />
            )}
          </div>

          {/* Archivo del Comprobante */}
          {receiptType !== "no_receipt" && (
            <div>
              <FormField
                control={form.control}
                name="receipt_file"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-sm">
                      Archivo del Comprobante{" "}
                      {mode === "create" && (
                        <span className="text-destructive">*</span>
                      )}
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
                            required={mode === "create"}
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
                      {mode === "create" ? "Requerido." : "Opcional."} Tamaño
                      máximo: 5MB. Archivos PDF o imágenes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Notas */}
          <div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
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
