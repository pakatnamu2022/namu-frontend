"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { History } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import {
  HistoricalAdvancePaymentSchema,
  type HistoricalAdvancePaymentSchema as HistoricalAdvancePaymentSchemaType,
} from "../lib/electronicDocument.schema";
import { registerHistoricalAdvancePayment } from "../lib/electronicDocument.actions";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import {
  usePurchaseRequestQuote,
  usePurchaseRequestQuoteById,
} from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.hook";
import { PurchaseRequestQuoteResource } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.interface";
import {
  useCustomers,
  useCustomersById,
} from "@/features/ap/comercial/clientes/lib/customers.hook";
import { AREA_COMERCIAL } from "@/features/ap/ap-master/lib/apMaster.constants";

interface HistoricalAdvancePaymentSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultValues: HistoricalAdvancePaymentSchemaType = {
  purchase_request_quote_id: "",
  sunat_concept_document_type_id: "",
  serie: "",
  numero: 0,
  area_id: AREA_COMERCIAL.toString(),
  client_id: "",
  fecha_de_emision: "",
  sunat_concept_currency_id: "",
  total: 0,
  observaciones: "",
};

export default function HistoricalAdvancePaymentSheet({
  open,
  onClose,
  onSuccess,
}: HistoricalAdvancePaymentSheetProps) {
  const form = useForm<HistoricalAdvancePaymentSchemaType>({
    resolver: zodResolver(HistoricalAdvancePaymentSchema) as any,
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const purchaseRequestQuoteId = form.watch("purchase_request_quote_id");

  const { data: quotation } = usePurchaseRequestQuoteById(
    purchaseRequestQuoteId ? Number(purchaseRequestQuoteId) : 0,
  );

  // Auto-completar cliente desde la cotización seleccionada
  useEffect(() => {
    if (quotation?.holder_id) {
      form.setValue("client_id", quotation.holder_id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotation]);

  const { data: documentTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE],
  });
  const { data: currencyTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY],
  });

  const registerMutation = useMutation({
    mutationFn: registerHistoricalAdvancePayment,
    onSuccess: (response) => {
      successToast(
        response.message || "Anticipo histórico registrado correctamente",
      );
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al registrar anticipo histórico: ${msg}`);
    },
  });

  const onSubmit = (data: HistoricalAdvancePaymentSchemaType) => {
    registerMutation.mutate(data);
  };

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Registrar Anticipo Histórico"
      subtitle="Registra una factura antigua de anticipo no emitida por Nubefact, solo como referencia contable."
      icon="History"
      size="5xl"
      childrenFooter={
        <div className="flex gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={registerMutation.isPending}
            className="flex-1"
          >
            Registrar
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <GroupFormSection
            title="Anticipo Histórico"
            icon={History}
            color="amber"
            cols={{ sm: 1, md: 3 }}
          >
            {/* Referencia: cotización y cliente */}
            <div className="md:col-span-3">
              <FormSelectAsync
                control={form.control}
                name="purchase_request_quote_id"
                useQueryHook={usePurchaseRequestQuote}
                mapOptionFn={(quote: PurchaseRequestQuoteResource) => ({
                  value: quote.id.toString(),
                  label: `COT-${quote.correlative} - ${quote.holder} - ${quote.doc_type_currency_symbol} ${quote.sale_price}`,
                })}
                label="Cotización *"
                description="Cotización a la que pertenece el anticipo histórico"
                placeholder="Seleccionar cotización"
                useFindByIdHook={usePurchaseRequestQuoteById}
                additionalParams={{
                  is_approved: 1,
                }}
              />
            </div>

            <div className="md:col-span-3">
              <FormSelectAsync
                control={form.control}
                name="client_id"
                label="Cliente *"
                placeholder="Seleccionar cliente"
                useQueryHook={useCustomers}
                mapOptionFn={(customer) => ({
                  value: customer.id.toString(),
                  label: `${customer.full_name} - ${customer.num_doc || "S/N"}`,
                })}
                description="Cliente asignado desde la cotización (puede modificarlo)"
                useFindByIdHook={useCustomersById}
              />
            </div>

            {/* Identificación del comprobante */}
            <FormSelect
              control={form.control}
              name="sunat_concept_document_type_id"
              options={documentTypes.map((type) => ({
                value: type.id.toString(),
                label: type.description,
              }))}
              label="Tipo de Comprobante *"
              placeholder="Seleccionar tipo"
            />

            <FormInput
              control={form.control}
              name="serie"
              label="Serie *"
              placeholder="Ej: F001"
            />

            <FormInput
              control={form.control}
              name="numero"
              label="Número *"
              type="number"
              min="1"
              placeholder="Ej: 123"
            />

            <DatePickerFormField
              control={form.control}
              name="fecha_de_emision"
              label="Fecha de Emisión *"
              placeholder="Seleccione fecha"
              description="Fecha real en la que se emitió el anticipo"
              disabledRange={{ after: new Date() }}
            />

            {/* Datos financieros */}
            <FormSelect
              control={form.control}
              name="sunat_concept_currency_id"
              options={currencyTypes.map((type) => ({
                value: type.id.toString(),
                label: type.description,
              }))}
              label="Moneda *"
              placeholder="Seleccionar moneda"
            />

            <FormInput
              control={form.control}
              name="total"
              label="Total (con IGV) *"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 5000.00"
              description="Monto total del anticipo, con IGV incluido"
            />

            {/* Notas */}
            <div className="md:col-span-3">
              <FormTextArea
                control={form.control}
                name="observaciones"
                label="Observaciones"
                placeholder="Observaciones adicionales..."
                optional
              />
            </div>
          </GroupFormSection>
        </form>
      </Form>
    </GeneralSheet>
  );
}
