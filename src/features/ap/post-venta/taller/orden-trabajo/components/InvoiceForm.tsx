"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DollarSign, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  invoiceSchemaCreate,
  type InvoiceSchema,
} from "../lib/invoice.schema";

export interface InvoiceFormData {
  groupNumber: number;
  clientName: string;
  description: string;
  amount: number;
  taxRate: number;
}

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: InvoiceFormData;
  onFormDataChange: (data: InvoiceFormData) => void;
  onSubmit: () => void;
}

export default function InvoiceForm({
  isOpen,
  onClose,
  formData,
  onFormDataChange,
  onSubmit,
}: InvoiceFormProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const form = useForm<InvoiceSchema>({
    resolver: zodResolver(invoiceSchemaCreate),
    defaultValues: formData,
  });

  const { watch } = form;
  const watchedAmount = watch("amount");
  const watchedTaxRate = watch("taxRate");

  // Sincronizar el formulario con formData cuando cambia
  useEffect(() => {
    form.reset(formData);
  }, [formData, form]);

  const calculateTaxAmount = () => {
    return (watchedAmount * watchedTaxRate) / 100;
  };

  const calculateTotalAmount = () => {
    return watchedAmount + calculateTaxAmount();
  };

  const handleFormSubmit = (data: InvoiceSchema) => {
    // Actualizar formData con los valores del formulario
    onFormDataChange(data);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    onSubmit();
    setShowConfirmation(false);
    toast.success("Factura creada exitosamente");
  };

  return (
    <>
      {/* Sheet para crear factura */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Crear Factura - Grupo {formData.groupNumber}
            </SheetTitle>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4 mt-6"
            >
              <div className="grid gap-4">
                {/* Cliente */}
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente / Nombre de Facturación</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre completo del cliente"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        Puede ser diferente al titular del vehículo
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción de la Factura</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detalle de los servicios facturados..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Monto y Tax */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtotal (S/)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tasa de IGV (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Resumen de montos */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">
                      S/ {(watchedAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      IGV ({watchedTaxRate || 0}%):
                    </span>
                    <span className="font-semibold">
                      S/ {calculateTaxAmount().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-green-600">
                      S/ {calculateTotalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <SheetFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit">
                  <Check className="h-4 w-4 mr-2" />
                  Crear Factura
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Confirmación */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar creación de factura?</AlertDialogTitle>
            <AlertDialogDescription>
              Se creará una factura para el Grupo {formData.groupNumber} por un
              total de S/ {calculateTotalAmount().toFixed(2)} a nombre de{" "}
              {form.watch("clientName")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
