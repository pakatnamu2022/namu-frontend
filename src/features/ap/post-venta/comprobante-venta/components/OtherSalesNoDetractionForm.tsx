"use client";

import { useState, useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";

import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { useAllApBank } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.hook";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { AdditionalConfigSection } from "@/features/ap/facturacion/electronic-documents/components/sections/AdditionalConfigSection";
import { ItemsSection } from "@/features/ap/facturacion/electronic-documents/components/sections/ItemsSection";
import { SummarySection } from "@/features/ap/facturacion/electronic-documents/components/sections/SummarySection";
import {
  DEFAULT_IGV_PERCENTAGE,
  getIgvCategory,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import {
  useNextCorrelativeElectronicDocument,
  useExchangeRateByDateAndCurrency,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { ElectronicDocumentSchema } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { DocumentInfoOtherSalesNoDetractionSection } from "./DocumentInfoOtherSalesNoDetractionSection";

interface ElectronicDocumentFormProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  onSubmit: (data: ElectronicDocumentSchema) => void;
  isPending: boolean;
  isEdit?: boolean;
  documentTypes?: SunatConceptsResource[];
  transactionTypes?: SunatConceptsResource[];
  identityDocumentTypes?: SunatConceptsResource[];
  currencyTypes?: SunatConceptsResource[];
  igvTypes?: SunatConceptsResource[];
  creditNoteTypes?: SunatConceptsResource[];
  debitNoteTypes?: SunatConceptsResource[];
  isCommercial?: boolean;
  sedeId?: string;
}

// Variante de OtherSalesForm sin Detracción: no se muestra el switch de detracción
// y el plan de cuenta contable de los items no se filtra por detracción (se listan todos).
export function OtherSalesNoDetractionForm({
  form,
  onSubmit,
  isPending,
  isEdit = false,
  documentTypes = [],
  transactionTypes = [],
  identityDocumentTypes = [],
  currencyTypes = [],
  igvTypes = [],
  isCommercial = true,
  sedeId,
}: ElectronicDocumentFormProps) {
  // Estado para el cliente seleccionado (manejado por DocumentInfoSection)
  const [selectedCustomer, setSelectedCustomer] = useState<
    CustomersResource | undefined
  >(undefined);

  // Sincronizar sunat_concept_transaction_type_id con is_advance_payment
  const isAdvancePayment = form.watch("is_advance_payment");
  useEffect(() => {
    const currentValue = form.getValues("sunat_concept_transaction_type_id");
    if (isAdvancePayment) {
      const anticipoType = transactionTypes.find(
        (t) => t.code_nubefact === "04",
      );
      if (anticipoType && currentValue !== anticipoType.id.toString()) {
        form.setValue(
          "sunat_concept_transaction_type_id",
          anticipoType.id.toString(),
        );
      }
    } else {
      const normalType = transactionTypes.find((t) => t.code_nubefact === "01");
      if (normalType && currentValue !== normalType.id.toString()) {
        form.setValue(
          "sunat_concept_transaction_type_id",
          normalType.id.toString(),
        );
      }
    }
  }, [isAdvancePayment, transactionTypes, form]);

  // OBJECTS
  const selectedCurrency = currencyTypes.find(
    (c) => c.id === Number(form.watch("sunat_concept_currency_id")),
  );

  // ID
  const selectedSeriesId = form.watch("serie");
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const fechaDeEmision = form.watch("fecha_de_emision");

  // Consultar series autorizadas
  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: documentTypes.find(
      (dt) => dt.id.toString() === selectedDocumentType,
    )?.tribute_code,
    ...(sedeId ? { sede_id: sedeId } : {}),
  });

  const selectedSeries = authorizedSeries.find(
    (s) => s.id.toString() === selectedSeriesId,
  );

  // Calcular porcentaje de IGV desde el cliente seleccionado
  const porcentaje_de_igv =
    selectedCustomer?.tax_class_type_igv || DEFAULT_IGV_PERCENTAGE;

  const series = form.watch("serie");

  // Solo consultar el siguiente correlativo cuando NO está en modo edición
  const { data: nextNumber } = useNextCorrelativeElectronicDocument(
    !isEdit && selectedDocumentType ? Number(selectedDocumentType) : 0,
    !isEdit && series ? Number(series) : 0,
  );

  const { data: checkbooks = [] } = useAllApBank({
    currency_id: selectedCurrency?.currency_type,
    sede_id: selectedSeries?.sede_id,
  });

  // Tipo de cambio: siempre consultar para la moneda seleccionada y la fecha de emisión
  const fechaDeEmisionStr = fechaDeEmision
    ? fechaDeEmision instanceof Date
      ? fechaDeEmision.toISOString().split("T")[0]
      : String(fechaDeEmision).split("T")[0]
    : "";
  const { data: exchangeRate } = useExchangeRateByDateAndCurrency(
    selectedCurrency?.currency_type ?? null,
    fechaDeEmisionStr,
  );

  // Solo aplica cuando no es useQuotation y tiene detracción activa
  const isUSD = selectedCurrency?.iso_code === "USD";
  const exchangeRateMissing = isUSD && !exchangeRate?.rate;

  useEffect(() => {
    if (isEdit) {
      form.setValue("numero", form.getValues("numero"));
      return;
    }
    // No actualizar en modo edición
    const currentNumber = form.getValues("numero");
    const newNumber = nextNumber?.number || "";
    if (currentNumber !== newNumber) {
      form.setValue("numero", newNumber);
    }
  }, [nextNumber, form, isEdit]);

  const currencySymbol =
    selectedCurrency?.iso_code === "PEN"
      ? "S/"
      : selectedCurrency?.iso_code === "USD"
        ? "$"
        : "";

  const rawItems = form.watch("items");
  const items = useMemo(() => rawItems || [], [rawItems]);

  const totales = useMemo(() => {
    const round2 = (n: number) => Math.round(n * 100) / 100;

    let raw_total_gravada = 0;
    let raw_total_inafecta = 0;
    let raw_total_exonerada = 0;
    let raw_total_gratuita = 0;
    let raw_total_anticipo = 0;
    let raw_sub_gravada = 0;
    let raw_sub_anticipo = 0;
    let raw_igv = 0;

    items.forEach((item) => {
      const igvType = igvTypes.find(
        (t) => t.id === item.sunat_concept_igv_type_id,
      );

      // Los items marcados como anticipo se descuentan del total a pagar
      if (item.anticipo_regularizacion) {
        raw_total_anticipo += item.total;
        raw_sub_anticipo += item.subtotal;
        return;
      }

      const category = getIgvCategory(igvType?.code_nubefact);
      if (category === "gravada") {
        raw_total_gravada += item.total;
        raw_sub_gravada += item.subtotal;
        raw_igv += item.igv;
      } else if (category === "exonerada") {
        raw_total_exonerada += item.subtotal;
      } else if (category === "inafecta") {
        raw_total_inafecta += item.subtotal;
      } else if (category === "gratuita") {
        raw_total_gratuita += item.subtotal;
      }
    });

    const t_anticipo = round2(raw_total_anticipo);
    const total_anticipo = round2(raw_sub_anticipo);
    const total_gravada = round2(round2(raw_sub_gravada) - total_anticipo);
    const total_inafecta = round2(raw_total_inafecta);
    const total_exonerada = round2(raw_total_exonerada);
    const total_gratuita = round2(raw_total_gratuita);
    const total_igv = round2(raw_igv);

    const total = round2(
      round2(raw_total_gravada) + total_inafecta + total_exonerada - t_anticipo,
    );

    return {
      total_gravada,
      total_inafecta,
      total_exonerada,
      total_igv,
      total_gratuita,
      total_anticipo,
      total,
    };
  }, [items, igvTypes]);

  useEffect(() => {
    const current = form.getValues();
    if (
      current.total_gravada !== totales.total_gravada ||
      current.total_inafecta !== totales.total_inafecta ||
      current.total_exonerada !== totales.total_exonerada ||
      current.total_igv !== totales.total_igv ||
      current.total_gratuita !== totales.total_gratuita ||
      current.total_anticipo !== totales.total_anticipo ||
      current.total !== totales.total
    ) {
      form.setValue("total_gravada", totales.total_gravada);
      form.setValue("total_inafecta", totales.total_inafecta);
      form.setValue("total_exonerada", totales.total_exonerada);
      form.setValue("total_igv", totales.total_igv);
      form.setValue("total_gratuita", totales.total_gratuita);
      form.setValue("total_anticipo", totales.total_anticipo);
      form.setValue("total", totales.total);
    }
  }, [totales, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario - 2/3 del ancho */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Documento */}
            <DocumentInfoOtherSalesNoDetractionSection
              form={form}
              isEdit={isEdit}
              documentTypes={documentTypes}
              authorizedSeries={authorizedSeries}
              isAdvancePayment={false}
              currencyTypes={currencyTypes}
              onCustomerChange={setSelectedCustomer}
            />
            {/* Agregar Items: sin filtrar el plan de cuenta contable por detracción, siempre gravado con IGV */}
            <ItemsSection
              form={form}
              igvTypes={igvTypes}
              currencySymbol={currencySymbol}
              porcentaje_de_igv={porcentaje_de_igv}
              isCommercial={isCommercial}
              isDetraction={false}
              filterByDetraction={false}
              igvMode="normal"
            />
            {/* Configuración Adicional */}
            <AdditionalConfigSection
              form={form}
              checkbooks={checkbooks}
              showCardLast4={true}
              showOrdenCompraServicio={true}
              isEdit={isEdit}
              isModuleCommercial={isCommercial}
            />
          </div>

          {/* Resumen tipo Recibo - 1/3 del ancho */}
          <SummarySection
            form={form}
            documentTypes={documentTypes}
            identityDocumentTypes={identityDocumentTypes}
            authorizedSeries={authorizedSeries}
            currencySymbol={currencySymbol}
            totales={totales}
            porcentaje_de_igv={porcentaje_de_igv}
            isEdit={isEdit}
            isPending={isPending}
            isAdvancePayment={false}
            selectedCustomer={selectedCustomer}
            onSubmit={form.handleSubmit(onSubmit)}
            exchangeRate={exchangeRate?.rate}
            exchangeRateMissing={exchangeRateMissing}
          />
        </div>
      </form>
    </Form>
  );
}
