"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import GeneralSheet from "@/src/shared/components/GeneralSheet";
import { FormSelect } from "@/src/shared/components/FormSelect";
import { FormSwitch } from "@/src/shared/components/FormSwitch";
import { SUNAT_CONCEPTS_TYPE } from "@/src/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { useAllSunatConcepts } from "@/src/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { ElectronicDocumentItem } from "../lib/electronicDocument.interface";
import { useAuthorizedSeries } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { CreditNoteSchema } from "../lib/electronicDocument.schema";
import { getNextCreditNoteNumber } from "../lib/electronicDocument.actions";
import { TYPE_RECEIPT_SERIES } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.constants";
import { CreditNoteItemsTable } from "./CreditNoteItemsTable";

// Export the type for backward compatibility
export type CreditNoteData = CreditNoteSchema;

interface CreditNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: CreditNoteSchema) => void;
  documentItems: ElectronicDocumentItem[];
  documentId: number;
  documentType: number; // Tipo de documento original (29: Factura, 30: Boleta)
  fecha_de_emision: string; // Fecha de emisión del documento original
  isPending?: boolean;
}

export function CreditNoteDialog({
  open,
  onClose,
  onConfirm,
  documentItems,
  documentId,
  documentType,
  isPending = false,
}: CreditNoteDialogProps) {
  // State for next credit note number verification
  const [nextNumber, setNextNumber] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  // Form setup
  const form = useForm<CreditNoteSchema>({
    resolver: zodResolver(CreditNoteSchema),
    defaultValues: {
      sunat_concept_credit_note_type_id: "",
      series: "",
      observaciones: "",
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: false,
      items: [],
    },
  });

  // Update items when documentItems change
  useEffect(() => {
    if (documentItems.length > 0) {
      // Map ElectronicDocumentItem to CreditNoteItemSchema
      // Important: Backend expects ALL values as POSITIVE
      // The backend will subtract items with anticipo_regularizacion=true internally
      const mappedItems = documentItems.map((item) => ({
        unidad_de_medida: item.unidad_de_medida,
        codigo: item.codigo,
        codigo_producto_sunat: item.codigo_producto_sunat,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        valor_unitario: Math.abs(item.valor_unitario),
        precio_unitario: Math.abs(item.precio_unitario),
        descuento: item.descuento ? Math.abs(item.descuento) : item.descuento,
        subtotal: Math.abs(item.subtotal),
        sunat_concept_igv_type_id: item.sunat_concept_igv_type_id,
        igv: Math.abs(item.igv),
        total: Math.abs(item.total),
        account_plan_id: item.account_plan_id,
        anticipo_regularizacion: item.anticipo_regularizacion,
        anticipo_documento_serie: item.anticipo_documento_serie,
        anticipo_documento_numero: item.anticipo_documento_numero,
      }));
      form.setValue("items", mappedItems);
    }
  }, [documentItems, form]);

  // Fetch credit note types from SUNAT
  const { data: creditNoteTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_CREDIT_NOTE_TYPE],
  });

  // Fetch authorized series for credit notes (document_type_id: 31)
  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: TYPE_RECEIPT_SERIES.NOTA_CREDITO,
  });

  // Watch series field to verify next number
  const selectedSeries = form.watch("series");

  // Verify next credit note number when series changes
  useEffect(() => {
    const verifyNextNumber = async () => {
      if (!selectedSeries) {
        setNextNumber(null);
        setVerificationError(null);
        return;
      }

      setIsVerifying(true);
      setVerificationError(null);

      try {
        const response = await getNextCreditNoteNumber(
          documentId,
          parseInt(selectedSeries),
          documentType
        );
        setNextNumber(response.number);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          "No se puede generar nota de crédito para esta serie";
        setVerificationError(errorMessage);
        setNextNumber(null);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyNextNumber();
  }, [selectedSeries, documentId, documentType]);

  // Handle form submission
  const handleSubmit = async (data: CreditNoteSchema) => {
    try {
      await onConfirm(data);
      handleClose();
    } catch (error) {
      // Error will be handled by the parent component
      console.error("Error creating credit note:", error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    form.reset();
    setNextNumber(null);
    setVerificationError(null);
    setIsVerifying(false);
    onClose();
  };

  // Watch observaciones for character count
  const observaciones = form.watch("observaciones") || "";

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Generar Nota de Crédito"
      side="right"
      className="w-full sm:max-w-4xl overflow-y-auto"
      icon={<FileText className="h-5 w-5 text-blue-600" />}
    >
      <div className="space-y-6 pb-20">
        {/* Descripción */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Complete la información requerida para generar la nota de crédito.
            Los items del documento original se copiarán automáticamente.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Credit Note Type */}
            <FormSelect
              name="sunat_concept_credit_note_type_id"
              control={form.control}
              label="Tipo de Nota de Crédito"
              placeholder="Seleccione el tipo"
              options={creditNoteTypes.map((type) => ({
                value: type.id.toString(),
                label: type.description,
              }))}
            />

            {/* Series */}
            <FormSelect
              name="series"
              control={form.control}
              label="Serie"
              placeholder="Seleccione la serie"
              options={authorizedSeries.map((serie) => ({
                value: serie.id.toString(),
                label: serie.series,
              }))}
              description="Seleccione la serie autorizada para notas de crédito"
            />

            {/* Verification Status */}
            {selectedSeries && (
              <div className="space-y-2">
                {isVerifying && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verificando disponibilidad...</span>
                  </div>
                )}

                {!isVerifying && verificationError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        Error de verificación
                      </p>
                      <p className="text-sm text-red-700">
                        {verificationError}
                      </p>
                    </div>
                  </div>
                )}

                {!isVerifying && nextNumber && !verificationError && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        Serie verificada
                      </p>
                      <p className="text-sm text-green-700">
                        Siguiente número: <strong>{nextNumber}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Observaciones */}
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Observaciones <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ej: Cliente solicitó anulación por error en pedido"
                      rows={4}
                      maxLength={250}
                      className="resize-none"
                    />
                  </FormControl>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                      {observaciones.length}/250 caracteres
                      {observaciones.length > 0 &&
                        observaciones.length < 10 && (
                          <span className="text-orange-600 ml-2">
                            (mínimo 10 caracteres)
                          </span>
                        )}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Send Options */}
            <div className="space-y-4 pt-2 border-t">
              <h4 className="text-sm font-medium">Opciones de envío</h4>

              <FormSwitch
                name="enviar_automaticamente_a_la_sunat"
                control={form.control}
                text="Enviar automáticamente a SUNAT"
              />

              <FormSwitch
                name="enviar_automaticamente_al_cliente"
                control={form.control}
                text="Enviar automáticamente al cliente"
              />
            </div>

            {/* Items Table */}
            <div className="pt-4 border-t">
              <CreditNoteItemsTable items={documentItems} />
            </div>

            {/* Form Actions - Fixed at bottom */}
            <div className="fixed bottom-0 right-0 w-full sm:max-w-4xl bg-background border-t p-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending || isVerifying || !form.formState.isValid}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending || isVerifying || !!verificationError || !nextNumber
                }
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Generar Nota de Crédito"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </GeneralSheet>
  );
}
