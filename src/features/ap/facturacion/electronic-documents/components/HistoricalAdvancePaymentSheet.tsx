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
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import {
  usePurchaseRequestQuote,
  usePurchaseRequestQuoteById,
} from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.hook";
import { PurchaseRequestQuoteResource } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.interface";
import {
  useCustomers,
  useCustomersById,
} from "@/features/ap/comercial/clientes/lib/customers.hook";
import { useAllAccountingAccountPlan } from "@/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.hook";
import { ACP_TYPE_SALE } from "@/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.constants";
import { AREA_COMERCIAL } from "@/features/ap/ap-master/lib/apMaster.constants";

interface HistoricalAdvancePaymentSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultValues: HistoricalAdvancePaymentSchemaType = {
  purchase_request_quote_id: "",
  sunat_concept_document_type_id: "",
  series_id: "",
  area_id: AREA_COMERCIAL.toString(),
  client_id: "",
  fecha_de_emision: "",
  sunat_concept_currency_id: "",
  total: 0,
  descripcion: "",
  account_plan_id: "",
  sunat_concept_igv_type_id: "",
  observaciones: "",
  condiciones_de_pago: "",
};

export default function HistoricalAdvancePaymentSheet({
  open,
  onClose,
  onSuccess,
}: HistoricalAdvancePaymentSheetProps) {
  const form = useForm<HistoricalAdvancePaymentSchemaType>({
    resolver: zodResolver(HistoricalAdvancePaymentSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const purchaseRequestQuoteId = form.watch("purchase_request_quote_id");
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");

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
  const { data: igvTypes = [] } = useAllSunatConcepts({
    type: [SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE],
  });

  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: documentTypes.find(
      (dt) => dt.id.toString() === selectedDocumentType,
    )?.tribute_code,
    sede_id: quotation?.sede_id,
  });

  const { data: accountPlans = [] } = useAllAccountingAccountPlan({
    type: ACP_TYPE_SALE,
    enable_commercial: 1,
  });

  const registerMutation = useMutation({
    mutationFn: registerHistoricalAdvancePayment,
    onSuccess: (response) => {
      successToast(response.message || "Anticipo histórico registrado correctamente");
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
      size="lg"
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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <GroupFormSection
            title="Anticipo Histórico"
            icon={History}
            color="amber"
            cols={{ sm: 1, md: 2 }}
          >
            <div className="md:col-span-2">
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
              />
            </div>

            <div className="md:col-span-2">
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

            <FormSelect
              control={form.control}
              name="series_id"
              options={authorizedSeries.map((series) => ({
                value: series.id.toString(),
                label: `${series.series} - ${series.sede || ""}`,
              }))}
              label="Serie *"
              description="Series autorizadas para su usuario"
              placeholder="Seleccionar serie"
            />

            <DatePickerFormField
              control={form.control}
              name="fecha_de_emision"
              label="Fecha de Emisión *"
              placeholder="Seleccione fecha"
              description="Fecha real en la que se emitió el anticipo"
              disabledRange={{ after: new Date() }}
            />

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

            <FormSelect
              control={form.control}
              name="account_plan_id"
              options={accountPlans.map((plan) => ({
                value: plan.id.toString(),
                label: `${plan.account} - ${plan.description}`,
              }))}
              label="Plan Contable"
              placeholder="Seleccionar plan contable"
            />

            <FormSelect
              control={form.control}
              name="sunat_concept_igv_type_id"
              options={igvTypes.map((type) => ({
                value: type.id.toString(),
                label: type.description,
              }))}
              label="Tipo de IGV"
              placeholder="Seleccionar tipo de IGV"
            />

            <div className="md:col-span-2">
              <FormTextArea
                control={form.control}
                name="descripcion"
                label="Descripción *"
                placeholder="Descripción del anticipo"
              />
            </div>

            <div className="md:col-span-2">
              <FormTextArea
                control={form.control}
                name="observaciones"
                label="Observaciones"
                placeholder="Observaciones adicionales..."
                optional
              />
            </div>

            <div className="md:col-span-2">
              <FormInput
                control={form.control}
                name="condiciones_de_pago"
                label="Condiciones de Pago"
                placeholder="Ej: Contado, Transferencia..."
                optional
              />
            </div>
          </GroupFormSection>
        </form>
      </Form>
    </GeneralSheet>
  );
}
