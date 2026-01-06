"use client";

import { useEffect, useRef, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import {
  ElectronicDocumentSchema,
  ElectronicDocumentItemSchema,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import {
  DEFAULT_IGV_PERCENTAGE,
  NUBEFACT_CODES,
  QUOTATION_ACCOUNT_PLAN_IDS,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import {
  useNextCorrelativeElectronicDocument,
  useAdvancePaymentsByQuotation,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { OrderQuotationDocumentInfoSection } from "./OrderQuotationDocumentInfoSection";
import { ItemsSection } from "@/features/ap/facturacion/electronic-documents/components/sections/ItemsSection";
import { AdditionalConfigSection } from "@/features/ap/facturacion/electronic-documents/components/sections/AdditionalConfigSection";
import { useAllCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { useAllApBank } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.hook";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";
import { OrderQuotationFinancialInfo } from "./OrderQuotationFinancialInfo";
import { OrderQuotationSummarySection } from "./OrderQuotationSummarySection";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

interface OrderQuotationBillingFormProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  onSubmit: (data: ElectronicDocumentSchema) => void;
  isPending: boolean;
  quotation: OrderQuotationResource;
  isEdit?: boolean;
}

export function OrderQuotationBillingForm({
  form,
  onSubmit,
  isPending,
  quotation,
  isEdit = false,
}: OrderQuotationBillingFormProps) {
  // Ref para rastrear la última cotización cargada (evitar loops)
  const lastLoadedQuotationId = useRef<number | null>(null);
  const lastLoadedAdvancePaymentState = useRef<boolean | null>(null);
  const processedAdvancePaymentsForQuotationKey = useRef<string | null>(null);
  const currencyAlreadySet = useRef<boolean>(false);

  // Obtener todos los conceptos SUNAT necesarios en una sola consulta
  const { data: sunatConcepts = [] } = useAllSunatConcepts({
    type: [
      SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE,
      SUNAT_CONCEPTS_TYPE.BILLING_TRANSACTION_TYPE,
      SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY,
      SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE,
    ],
  });

  // Filtrar los conceptos por tipo
  const documentTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) => concept.type === SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE
      ),
    [sunatConcepts]
  );

  const transactionTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) =>
          concept.type === SUNAT_CONCEPTS_TYPE.BILLING_TRANSACTION_TYPE
      ),
    [sunatConcepts]
  );

  const currencyTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) => concept.type === SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY
      ),
    [sunatConcepts]
  );

  const igvTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) => concept.type === SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE
      ),
    [sunatConcepts]
  );

  const items = form.watch("items") || [];

  // OBJECTS
  const selectedCurrency = currencyTypes.find(
    (c) => c.id === Number(form.watch("sunat_concept_currency_id"))
  );

  // ID
  const selectedSeriesId = form.watch("serie");
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const clientId = form.watch("client_id");
  const isAdvancePayment = form.watch("is_advance_payment") || false;

  // Consultar series autorizadas
  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: documentTypes.find(
      (dt) => dt.id.toString() === selectedDocumentType
    )?.tribute_code,
  });

  const selectedSeries = authorizedSeries.find(
    (s) => s.id.toString() === selectedSeriesId
  );

  // Obtener todos los clientes para calcular el IGV
  const { data: customers = [] } = useAllCustomers();
  const selectedCustomer = customers.find(
    (customer) => customer.id.toString() === clientId
  );

  // Calcular porcentaje de IGV desde el cliente seleccionado
  const porcentaje_de_igv =
    selectedCustomer?.tax_class_type_igv || DEFAULT_IGV_PERCENTAGE;

  // Obtener anticipos previos (simulado, puede que no haya anticipos para cotizaciones de taller)
  const { data: advancePaymentsResponse } = useAdvancePaymentsByQuotation(null); // No hay cotización de comercial vinculada

  // Calcular el saldo pendiente
  const quotationPrice = quotation ? quotation.total_amount : 0;
  const totalAdvancesAmount = advancePaymentsResponse
    ? advancePaymentsResponse.total_amount || 0
    : 0;
  const pendingBalance = quotationPrice - totalAdvancesAmount;

  // Cambiar tipo de operación según si es anticipo o no
  useEffect(() => {
    if (transactionTypes.length === 0) return;

    const currentValue = form.getValues("sunat_concept_transaction_type_id");

    if (isAdvancePayment) {
      // Anticipo: code_nubefact "04" - Venta Interna - Anticipos
      const anticipoType = transactionTypes.find(
        (type) => type.code_nubefact === "04"
      );
      if (anticipoType && currentValue !== anticipoType.id.toString()) {
        form.setValue(
          "sunat_concept_transaction_type_id",
          anticipoType.id.toString(),
          { shouldValidate: false }
        );
      }
    } else {
      // Normal: code_nubefact "01" - Venta Interna
      const normalType = transactionTypes.find(
        (type) => type.code_nubefact === "01"
      );
      if (normalType && currentValue !== normalType.id.toString()) {
        form.setValue(
          "sunat_concept_transaction_type_id",
          normalType.id.toString(),
          { shouldValidate: false }
        );
      }
    }
  }, [isAdvancePayment, transactionTypes, form]);

  // Efecto para cargar datos de la cotización
  useEffect(() => {
    // Esperar a que currencyTypes esté cargado antes de procesar
    if (!quotation || currencyTypes.length === 0) return;

    if (quotation.id !== lastLoadedQuotationId.current) {
      lastLoadedQuotationId.current = quotation.id;
      currencyAlreadySet.current = false; // Reset cuando cambia la cotización

      // NOTA: El cliente se setea en OrderQuotationDocumentInfoSection
      // a través de defaultCustomer para evitar race conditions con FormSelectAsync

      // Mapear moneda de la cotización con la moneda de SUNAT usando el tribute_code
      if (quotation.currency?.id && !currencyAlreadySet.current) {
        const matchedCurrency = currencyTypes.find(
          (c) => c.tribute_code === String(quotation.currency.id)
        );

        if (matchedCurrency) {
          form.setValue(
            "sunat_concept_currency_id",
            matchedCurrency.id.toString(),
            { shouldValidate: false }
          );
          currencyAlreadySet.current = true;
        }
      } else if (!currencyAlreadySet.current) {
        // Fallback: Moneda por defecto PEN (Soles)
        const penCurrency = currencyTypes.find((c) => c.iso_code === "PEN");
        if (penCurrency) {
          form.setValue(
            "sunat_concept_currency_id",
            penCurrency.id.toString(),
            { shouldValidate: false }
          );
          currencyAlreadySet.current = true;
        }
      }
    }
  }, [quotation?.id, currencyTypes, form]);

  // Efecto para cargar items cuando cambia la cotización o isAdvancePayment
  useEffect(() => {
    if (
      !quotation ||
      igvTypes.length === 0 ||
      (quotation.id === lastLoadedQuotationId.current &&
        isAdvancePayment === lastLoadedAdvancePaymentState.current)
    ) {
      return;
    }

    lastLoadedAdvancePaymentState.current = isAdvancePayment;
    processedAdvancePaymentsForQuotationKey.current = null;

    // Crear items desde los detalles de la cotización
    if (quotation.details && quotation.details.length > 0) {
      if (isAdvancePayment) {
        // CONSOLIDAR ITEMS EN UNO SOLO PARA ANTICIPO
        // Concatenar los nombres de todos los productos
        const productNames = quotation.details
          .map((detail) => detail.description || "SERVICIO DE TALLER")
          .join(", ");

        // Calcular el total consolidado
        let totalConsolidado = 0;
        quotation.details.forEach((detail) => {
          totalConsolidado += detail.total_amount || 0;
        });

        // Crear un solo item consolidado
        const precio_unitario = totalConsolidado;
        const valor_unitario =
          precio_unitario / (1 + porcentaje_de_igv / 100);

        const subtotal = valor_unitario;
        const igvAmount = subtotal * (porcentaje_de_igv / 100);

        const quotationItems: ElectronicDocumentItemSchema[] = [
          {
            account_plan_id: QUOTATION_ACCOUNT_PLAN_IDS.ADVANCE_PAYMENT,
            unidad_de_medida: "NIU",
            codigo: quotation.id?.toString(),
            descripcion: `ANTICIPO POR ${productNames}`,
            cantidad: 1,
            valor_unitario: valor_unitario,
            precio_unitario: precio_unitario,
            subtotal: subtotal,
            sunat_concept_igv_type_id:
              igvTypes.find(
                (t) => t.code_nubefact === NUBEFACT_CODES.GRAVADA_ONEROSA
              )?.id || 0,
            igv: igvAmount,
            total: subtotal + igvAmount,
          },
        ];

        form.setValue("is_advance_payment", true, { shouldValidate: false });
        form.setValue("items", quotationItems, { shouldValidate: false });
      } else {
        // ITEMS NORMALES (SIN CONSOLIDAR)
        const quotationItems: ElectronicDocumentItemSchema[] =
          quotation.details.map((detail) => {
            const cantidad = Number(detail.quantity) || 1;
            const precio_con_igv = detail.total_amount || 0;

            // Calcular precio unitario con IGV
            const precio_unitario = precio_con_igv / cantidad;
            const valor_unitario =
              precio_unitario / (1 + porcentaje_de_igv / 100);

            const subtotal = valor_unitario * cantidad;
            const igvAmount = subtotal * (porcentaje_de_igv / 100);

            return {
              account_plan_id: QUOTATION_ACCOUNT_PLAN_IDS.FULL_SALE,
              unidad_de_medida: "NIU",
              codigo: detail.id?.toString(),
              descripcion: detail.description || "SERVICIO DE TALLER",
              cantidad: cantidad,
              valor_unitario: valor_unitario,
              precio_unitario: precio_unitario,
              subtotal: subtotal,
              sunat_concept_igv_type_id:
                igvTypes.find(
                  (t) => t.code_nubefact === NUBEFACT_CODES.GRAVADA_ONEROSA
                )?.id || 0,
              igv: igvAmount,
              total: subtotal + igvAmount,
            };
          });

        form.setValue("items", quotationItems, { shouldValidate: false });
      }
    }
  }, [
    quotation?.id,
    quotation?.details,
    igvTypes,
    porcentaje_de_igv,
    isAdvancePayment,
    form,
  ]);

  // Calcular totales
  const totales = useMemo(() => {
    let total_gravada = 0;
    let total_inafecta = 0;
    let total_exonerada = 0;
    let total_igv = 0;
    let total_gratuita = 0;
    let total_anticipo = 0;

    items.forEach((item) => {
      const igvType = igvTypes.find(
        (t) => t.id === item.sunat_concept_igv_type_id
      );

      if (igvType?.code_nubefact === "1") {
        // Gravado
        if (item.anticipo_regularizacion) {
          total_gravada += -item.subtotal;
          total_anticipo += item.subtotal;
        } else {
          total_gravada += item.subtotal;
        }
      } else if (igvType?.code_nubefact === "20") {
        // Exonerado
        if (item.anticipo_regularizacion) {
          total_exonerada += item.subtotal;
          total_anticipo += item.subtotal;
        } else {
          total_exonerada += item.subtotal;
        }
      } else if (igvType?.code_nubefact === "30") {
        // Inafecto
        if (item.anticipo_regularizacion) {
          total_anticipo += item.subtotal;
        } else {
          total_inafecta += item.subtotal;
        }
      } else if (
        igvType?.code_nubefact?.startsWith("1") ||
        igvType?.code_nubefact?.startsWith("2")
      ) {
        // Gratuito
        total_gratuita += item.subtotal;
      }
    });

    total_igv = total_gravada * (porcentaje_de_igv / 100);
    const total = total_gravada + total_inafecta + total_exonerada + total_igv;

    return {
      total_gravada,
      total_inafecta,
      total_exonerada,
      total_igv,
      total_gratuita,
      total_anticipo,
      total,
    };
  }, [items, igvTypes, porcentaje_de_igv]);

  // Actualizar form values cuando cambien los cálculos
  useEffect(() => {
    form.setValue("total_gravada", totales.total_gravada, {
      shouldValidate: false,
    });
    form.setValue("total_inafecta", totales.total_inafecta, {
      shouldValidate: false,
    });
    form.setValue("total_exonerada", totales.total_exonerada, {
      shouldValidate: false,
    });
    form.setValue("total_igv", totales.total_igv, { shouldValidate: false });
    form.setValue("total_gratuita", totales.total_gratuita, {
      shouldValidate: false,
    });
    form.setValue("total_anticipo", totales.total_anticipo, {
      shouldValidate: false,
    });
    form.setValue("total", totales.total, { shouldValidate: false });
  }, [totales, form]);

  const series = form.watch("serie");

  // Solo consultar el siguiente correlativo cuando NO está en modo edición
  const { data: nextNumber } = useNextCorrelativeElectronicDocument(
    !isEdit && selectedDocumentType ? Number(selectedDocumentType) : 0,
    !isEdit && series ? Number(series) : 0
  );

  const { data: checkbooks = [] } = useAllApBank({
    currency_id: selectedCurrency?.currency_type,
    sede_id: selectedSeries?.sede_id,
  });

  useEffect(() => {
    if (isEdit) {
      return;
    }
    const newNumber = nextNumber?.number || "";
    if (newNumber && form.getValues("numero") !== newNumber) {
      form.setValue("numero", newNumber, { shouldValidate: false });
    }
  }, [nextNumber?.number, form, isEdit]);

  const currencySymbol =
    selectedCurrency?.iso_code === "PEN"
      ? "S/"
      : selectedCurrency?.iso_code === "USD"
      ? "$"
      : "";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario - 2/3 del ancho */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Financiera de la Cotización */}
            {quotation && (
              <OrderQuotationFinancialInfo
                quotation={quotation}
                advances={[]}
                currencySymbol={currencySymbol}
              />
            )}

            {/* Información del Documento */}
            <OrderQuotationDocumentInfoSection
              form={form}
              isEdit={isEdit}
              documentTypes={documentTypes}
              authorizedSeries={authorizedSeries}
              isAdvancePayment={isAdvancePayment}
              currencyTypes={currencyTypes}
              isFromQuotation={true}
              defaultCustomer={quotation.vehicle?.owner}
            />

            {/* Agregar Items */}
            <ItemsSection
              form={form}
              igvTypes={igvTypes}
              currencySymbol={currencySymbol}
              porcentaje_de_igv={porcentaje_de_igv}
              isAdvancePayment={isAdvancePayment}
              maxAdvanceAmount={
                isAdvancePayment ? Math.max(pendingBalance, 0) : undefined
              }
              isFromQuotation={false}
            />

            {/* Configuración Adicional */}
            <AdditionalConfigSection form={form} checkbooks={checkbooks} />
          </div>
          {/* Resumen tipo Recibo - 1/3 del ancho */}
          <OrderQuotationSummarySection
            form={form}
            documentTypes={documentTypes}
            authorizedSeries={authorizedSeries}
            currencySymbol={currencySymbol}
            totales={totales}
            porcentaje_de_igv={porcentaje_de_igv}
            isEdit={isEdit}
            isPending={isPending}
            isAdvancePayment={isAdvancePayment}
            quotation={quotation}
            advancePayments={[]}
          />
        </div>
      </form>
    </Form>
  );
}
