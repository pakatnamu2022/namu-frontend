"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, ExpenseSchema } from "../lib/expense.schema";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { Option } from "@/core/core.interface";
import { useAvailableExpenseTypes } from "../lib/perDiemExpense.hook";
import { FileUploadWithCamera } from "@/shared/components/FileUploadWithCamera";
import { useRucValidation } from "@/shared/hooks/useDocumentValidation";
import { Building2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormInputText } from "@/shared/components/FormInputText";
import { TYPE_EXPENSE_LOCAL_MOBILITY } from "../lib/perDiemExpense.constants";

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
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

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
  const rucValue = form.watch("ruc");

  // Validación de RUC cuando el campo tiene 11 dígitos (RUC peruano estándar)
  const shouldValidateRuc = Boolean(
    !isFirstLoad &&
      rucValue &&
      rucValue.length === 11 &&
      /^\d+$/.test(rucValue) &&
      (receiptType === "invoice" || receiptType === "ticket")
  );

  const {
    data: rucData,
    isLoading: isRucLoading,
    error: rucError,
  } = useRucValidation(rucValue, shouldValidateRuc, false);

  // Marcar como no es primera carga después del primer cambio
  useEffect(() => {
    if (rucValue && isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [rucValue, isFirstLoad]);

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

  // Limpiar número de comprobante, RUC y archivo cuando el tipo es "Sin Comprobante"
  useEffect(() => {
    if (receiptType === "no_receipt") {
      form.setValue("receipt_number", "");
      form.setValue("ruc", "");
      form.setValue("receipt_file", undefined);
      setSelectedFile(null);
      setPreviewUrl("");
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
    { value: "ticket", label: "Boleta" },
    { value: "no_receipt", label: "Sin Comprobante" },
  ];

  // Deshabilitar fechas fuera del rango de la solicitud de viáticos
  const disabledDates = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date < startDate || date > endDate;
  };

  // Verificar si el RUC es válido antes de permitir envío
  const isRucValid = () => {
    // Si no se requiere RUC, es válido
    if (receiptType === "no_receipt") return true;

    // Si no hay RUC ingresado, el schema lo validará
    if (!rucValue || rucValue.trim() === "") return true;

    // Si hay RUC y tiene 11 dígitos, debe estar validado exitosamente
    if (rucValue.length === 11) {
      // Verificar que success sea true y que data exista y sea válido
      return rucData?.success === true && rucData?.data?.valid === true;
    }

    // Si tiene menos de 11 dígitos, aún no es válido
    return false;
  };

  const canSubmit = form.formState.isValid && isRucValid() && !isRucLoading;

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

            {(receiptType === "invoice" || receiptType === "ticket") && (
              <FormInput
                name="ruc"
                label="RUC del Proveedor"
                placeholder="20123456789"
                description="RUC de 11 dígitos del proveedor"
                control={form.control}
                required
                maxLength={20}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            )}
          </div>

          {/* Indicador de validación y datos del proveedor */}
          {rucValue &&
            rucValue.length === 11 &&
            (receiptType === "invoice" || receiptType === "ticket") && (
              <div className="mt-2">
                {isRucLoading && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <AlertDescription className="ml-2 text-xs text-blue-700">
                      Validando RUC...
                    </AlertDescription>
                  </Alert>
                )}

                {!isRucLoading && rucError && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="ml-2 text-xs text-red-700">
                      RUC no válido. Ingrese un RUC registrado en SUNAT.
                    </AlertDescription>
                  </Alert>
                )}

                {!isRucLoading &&
                  rucData?.success === true &&
                  rucData?.data?.valid === true && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="ml-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-xs font-semibold text-green-900">
                              {rucData.data.business_name}
                            </span>
                          </div>
                          <div className="text-xs text-green-700">
                            <span className="font-medium">Estado:</span>{" "}
                            {rucData.data.status} •
                            <span className="font-medium ml-1">Condición:</span>{" "}
                            {rucData.data.condition}
                          </div>
                          {rucData.data.address && (
                            <div className="text-xs text-green-700">
                              <span className="font-medium">Dirección:</span>{" "}
                              {rucData.data.address}
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
              </div>
            )}

          {/* Archivo del Comprobante */}
          {receiptType !== "no_receipt" && (
            <div>
              <FormField
                control={form.control}
                name="receipt_file"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormControl>
                      <FileUploadWithCamera
                        label={`Archivo del Comprobante${
                          mode === "create" ? " *" : ""
                        }`}
                        accept="application/pdf,image/*"
                        value={selectedFile}
                        previewUrl={previewUrl}
                        onChange={(file, url) => {
                          setSelectedFile(file);
                          setPreviewUrl(url);
                          onChange(file);
                        }}
                        showPreview={true}
                        showFileInfo={true}
                      />
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
            <FormInputText
              name="notes"
              label={
                expenseTypeId === TYPE_EXPENSE_LOCAL_MOBILITY
                  ? "Notas"
                  : "Notas (Opcional)"
              }
              placeholder="Observaciones adicionales..."
              control={form.control}
              rows={3}
              required={expenseTypeId === TYPE_EXPENSE_LOCAL_MOBILITY}
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
            disabled={isSubmitting || !canSubmit}
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
