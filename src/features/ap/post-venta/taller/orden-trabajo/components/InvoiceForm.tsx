"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { Form } from "@/components/ui/form";
import { Check, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { invoiceSchemaCreate, type InvoiceSchema } from "../lib/invoice.schema";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { CUSTOMERS_PV } from "@/features/ap/comercial/clientes/lib/customers.constants";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useIsTablet } from "@/hooks/use-mobile";
import { FormInputText } from "@/shared/components/FormInputText";
import { FormInput } from "@/shared/components/FormInput";
import { useMutation } from "@tanstack/react-query";
import { storeElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import type { ElectronicDocumentSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";

export interface InvoiceFormData {
  groupNumber: number;
  customer_id: string;
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
  const isTablet = useIsTablet();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const form = useForm<InvoiceSchema>({
    resolver: zodResolver(invoiceSchemaCreate),
    defaultValues: formData,
  });

  const { watch } = form;
  const watchedAmount = watch("amount");
  const watchedTaxRate = watch("taxRate");

  // Mutación para crear documento electrónico
  const createInvoiceMutation = useMutation({
    mutationFn: (data: ElectronicDocumentSchema) =>
      storeElectronicDocument(data),
    onSuccess: () => {
      toast.success("Factura creada exitosamente");
      setShowConfirmation(false);
      onSubmit();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al crear la factura");
      console.error("Error creando factura:", error);
    },
  });

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
    const formValues = form.getValues();

    // Preparar datos para el documento electrónico
    const electronicDocumentData: ElectronicDocumentSchema = {
      // Tipo de documento y serie (valores temporales, ajustar según API)
      sunat_concept_document_type_id: "1", // Factura
      serie: "1", // Serie temporal

      // Tipo de operación
      sunat_concept_transaction_type_id: "1", // Venta interna

      // Origen del documento
      origin_module: "posventa",
      is_advance_payment: false,

      // Cliente
      client_id: formValues.customer_id,

      // Fechas
      fecha_de_emision: new Date().toISOString().split("T")[0],

      // Moneda
      sunat_concept_currency_id: "1", // PEN - Soles

      // Totales
      total_gravada: formValues.amount,
      total_igv: calculateTaxAmount(),
      total: calculateTotalAmount(),

      // Condiciones de pago
      condiciones_de_pago: "CONTADO",
      medio_de_pago: "EFECTIVO",

      // Configuración
      enviar_automaticamente_a_la_sunat: false,
      enviar_automaticamente_al_cliente: false,

      // Items (crear un item con la descripción)
      items: [
        {
          unidad_de_medida: "NIU", // Unidad
          descripcion: formValues.description,
          cantidad: 1,
          valor_unitario: formValues.amount,
          precio_unitario: formValues.amount + calculateTaxAmount(),
          subtotal: formValues.amount,
          sunat_concept_igv_type_id: 10, // Gravado - Operación Onerosa
          igv: calculateTaxAmount(),
          total: calculateTotalAmount(),
          account_plan_id: "1", // Plan contable temporal
        },
      ],
    };

    createInvoiceMutation.mutate(electronicDocumentData);
  };

  return (
    <>
      {/* Sheet para crear factura */}
      <GeneralSheet
        open={isOpen}
        onClose={onClose}
        title={`Crear Factura - Grupo ${formData.groupNumber}`}
        type={isTablet ? "tablet" : "default"}
        className="sm:max-w-2xl"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4 px-4"
          >
            <div className="grid gap-4">
              {/* Cliente */}
              <FormSelectAsync
                placeholder="Seleccionar cliente"
                control={form.control}
                label={"Cliente"}
                name="customer_id"
                useQueryHook={useCustomers}
                mapOptionFn={(item: CustomersResource) => ({
                  value: item.id.toString(),
                  label: `${item.full_name}`,
                })}
                perPage={10}
                debounceMs={500}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  className="aspect-square"
                  onClick={() => window.open(CUSTOMERS_PV.ROUTE_ADD, "_blank")}
                  tooltip="Agregar nuevo cliente"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </FormSelectAsync>

              {/* Descripción */}
              <FormInputText
                control={form.control}
                name="description"
                label="Descripción de la Factura"
                placeholder="Detalle de los servicios facturados..."
              />

              {/* Monto y Tax */}
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  control={form.control}
                  name="amount"
                  label="Subtotal (S/)"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  min={0}
                />

                <FormInput
                  control={form.control}
                  name="taxRate"
                  label="Tasa de IGV (%)"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  min={0}
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit">
                <Check className="h-4 w-4 mr-2" />
                Crear Factura
              </Button>
            </div>
          </form>
        </Form>
      </GeneralSheet>

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
            <AlertDialogCancel disabled={createInvoiceMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={createInvoiceMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createInvoiceMutation.isPending ? "Creando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
