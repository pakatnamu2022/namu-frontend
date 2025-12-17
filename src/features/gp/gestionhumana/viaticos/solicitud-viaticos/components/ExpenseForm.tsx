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
import { useState } from "react";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpenseFormProps {
  onSubmit: (data: ExpenseSchema) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export default function ExpenseForm({
  onSubmit,
  isSubmitting = false,
  onCancel,
}: ExpenseFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ExpenseSchema>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      receipt_amount: 0,
      company_amount: 0,
      employee_amount: 0,
      receipt_type: "receipt",
    },
    mode: "onChange",
  });

  const receiptAmount = form.watch("receipt_amount");
  const companyAmount = form.watch("company_amount");

  // Auto-calculate employee amount
  const handleAmountChange = () => {
    const employeeAmount = receiptAmount - companyAmount;
    form.setValue("employee_amount", Math.max(0, employeeAmount));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DatePickerFormField
          control={form.control}
          name="expense_date"
          label="Fecha del Gasto"
          placeholder="Selecciona una fecha"
          dateFormat="dd/MM/yyyy"
          captionLayout="dropdown"
        />

        <FormField
          control={form.control}
          name="expense_type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Gasto</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="4">Desayuno</SelectItem>
                  <SelectItem value="5">Almuerzo</SelectItem>
                  <SelectItem value="6">Cena</SelectItem>
                  <SelectItem value="7">Transporte</SelectItem>
                  <SelectItem value="8">Hospedaje</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="concept"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concepto</FormLabel>
              <FormControl>
                <Input placeholder="Descripción del gasto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="receipt_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto Comprobante</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value) || 0);
                      setTimeout(handleAmountChange, 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto Empresa</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value) || 0);
                      setTimeout(handleAmountChange, 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employee_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto Empleado</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
                <FormDescription>Calculado automáticamente</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="receipt_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Comprobante</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="receipt">Boleta</SelectItem>
                    <SelectItem value="invoice">Factura</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receipt_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Comprobante</FormLabel>
                <FormControl>
                  <Input placeholder="B001-00000001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="receipt_file"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Archivo del Comprobante</FormLabel>
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
                      className="pl-10"
                      {...field}
                      value={undefined}
                    />
                    <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
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
            <FormItem>
              <FormLabel>Notas (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones adicionales..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 w-full justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {isSubmitting ? "Guardando..." : "Guardar Gasto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
