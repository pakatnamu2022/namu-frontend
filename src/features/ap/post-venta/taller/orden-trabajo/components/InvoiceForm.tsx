"use client";

import { useEffect, useMemo, useRef } from "react";
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
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { AssignSalesSeriesResource } from "@/features/ap/configuraciones/maestros-general/asignar-serie-venta/lib/assignSalesSeries.interface";
import { ApBankResource } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.interface";
import { InvoiceDocumentInfoSection } from "./InvoiceDocumentInfoSection";
import { InvoiceSummarySection } from "./InvoiceSummarySection";
import { AdditionalConfigSection } from "@/features/ap/facturacion/electronic-documents/components/sections/AdditionalConfigSection";
import { ItemsSection } from "@/features/ap/facturacion/electronic-documents/components/sections/ItemsSection";
import { WorkOrderResource } from "../lib/workOrder.interface";
import { WorkOrderFinancialInfo } from "./WorkOrderFinancialInfo";

interface InvoiceFormProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  onSubmit: (data: ElectronicDocumentSchema) => void;
  onCancel: () => void;
  isPending: boolean;
  isEdit?: boolean;
  selectedGroupNumber: number | null;
  documentTypes: SunatConceptsResource[];
  transactionTypes: SunatConceptsResource[];
  currencyTypes: SunatConceptsResource[];
  igvTypes: SunatConceptsResource[];
  authorizedSeries: AssignSalesSeriesResource[];
  checkbooks: ApBankResource[];
  workOrder: WorkOrderResource;
}

export default function InvoiceForm({
  form,
  onSubmit,
  onCancel,
  isPending,
  isEdit = false,
  selectedGroupNumber,
  documentTypes,
  transactionTypes,
  currencyTypes,
  igvTypes,
  authorizedSeries,
  checkbooks,
  workOrder,
}: InvoiceFormProps) {
  // Cliente por defecto desde la orden de trabajo y otros datos necesarios
  const defaultCustomer = workOrder.invoice_to_client;
  const labours = workOrder.labours;
  const parts = workOrder.parts;
  const advances = workOrder.advances;

  // Ref para evitar loops
  const lastLoadedAdvancePaymentState = useRef<boolean | null>(null);
  const itemsAlreadyLoaded = useRef<boolean>(false);

  // Watch para obtener valores en tiempo real
  const selectedCurrencyId = form.watch("sunat_concept_currency_id");
  const isAdvancePayment = form.watch("is_advance_payment") || false;

  const selectedCustomer = defaultCustomer;

  // Calcular porcentaje de IGV desde el cliente seleccionado
  const porcentaje_de_igv =
    selectedCustomer?.tax_class_type_igv || DEFAULT_IGV_PERCENTAGE;

  // Obtener el símbolo de moneda
  const selectedCurrency = currencyTypes.find(
    (c) => c.id === Number(selectedCurrencyId),
  );

  const currencySymbol =
    selectedCurrency?.iso_code === "PEN"
      ? "S/"
      : selectedCurrency?.iso_code === "USD"
        ? "$"
        : "S/";

  // Cambiar tipo de operación según si es anticipo o no
  useEffect(() => {
    if (transactionTypes.length === 0) return;

    const currentValue = form.getValues("sunat_concept_transaction_type_id");

    if (isAdvancePayment) {
      // Anticipo: code_nubefact "04" - Venta Interna - Anticipos
      const anticipoType = transactionTypes.find(
        (type) => type.code_nubefact === "04",
      );
      if (anticipoType && currentValue !== anticipoType.id.toString()) {
        form.setValue(
          "sunat_concept_transaction_type_id",
          anticipoType.id.toString(),
          { shouldValidate: false },
        );
      }
    } else {
      // Verificar si hay anticipos previos en la orden de trabajo
      const hasAdvances = advances?.some(
        (advance) => advance.is_advance_payment === true,
      );

      if (hasAdvances) {
        // Venta final con anticipos: code_nubefact "04" - Venta Interna - Anticipos
        const anticipoType = transactionTypes.find(
          (type) => type.code_nubefact === "04",
        );
        if (anticipoType && currentValue !== anticipoType.id.toString()) {
          form.setValue(
            "sunat_concept_transaction_type_id",
            anticipoType.id.toString(),
            { shouldValidate: false },
          );
        }
      } else {
        // Venta completa sin anticipos: code_nubefact "01" - Venta Interna
        const normalType = transactionTypes.find(
          (type) => type.code_nubefact === "01",
        );
        if (normalType && currentValue !== normalType.id.toString()) {
          form.setValue(
            "sunat_concept_transaction_type_id",
            normalType.id.toString(),
            { shouldValidate: false },
          );
        }
      }
    }
  }, [isAdvancePayment, transactionTypes, advances, form]);

  // Efecto para cargar datos de la cotización
  useEffect(() => {
    // Esperar a que currencyTypes esté cargado antes de procesar
    if (!workOrder || currencyTypes.length === 0) return;

    // Mapear moneda de la cotización con la moneda de SUNAT usando el tribute_code
    if (workOrder.type_currency?.id) {
      const matchedCurrency = currencyTypes.find(
        (c) => c.tribute_code === String(workOrder.type_currency.id),
      );

      if (matchedCurrency) {
        form.setValue(
          "sunat_concept_currency_id",
          matchedCurrency.id.toString(),
          { shouldValidate: false },
        );
      }
    }
  }, [workOrder?.id, currencyTypes, form]);

  // Efecto para cargar items automáticamente desde labours y parts
  useEffect(() => {
    if (igvTypes.length === 0) return;

    // Verificar si ya se cargaron los items o si cambió el estado de anticipo
    const shouldReload =
      !itemsAlreadyLoaded.current ||
      isAdvancePayment !== lastLoadedAdvancePaymentState.current;

    if (!shouldReload) return;

    lastLoadedAdvancePaymentState.current = isAdvancePayment;
    itemsAlreadyLoaded.current = true;

    const gravadaType = igvTypes.find(
      (t) => t.code_nubefact === NUBEFACT_CODES.GRAVADA_ONEROSA,
    );

    if (isAdvancePayment) {
      // MODO ANTICIPO: Consolidar todo en un solo item
      const allDescriptions: string[] = [];

      // Agregar descripciones de mano de obra
      labours.forEach((labour) => {
        allDescriptions.push(labour.description);
      });

      // Agregar descripciones de repuestos
      parts.forEach((part) => {
        allDescriptions.push(part.product_name);
      });

      const consolidatedDescription =
        allDescriptions.length > 0
          ? `ANTICIPO POR ${allDescriptions.join(", ")}`
          : "ANTICIPO POR SERVICIOS DE TALLER";

      // Crear un solo item consolidado con valores en 0 para que el usuario los edite
      const anticipoItem: ElectronicDocumentItemSchema = {
        account_plan_id: QUOTATION_ACCOUNT_PLAN_IDS.ADVANCE_PAYMENT,
        unidad_de_medida: "ZZ",
        codigo: selectedGroupNumber?.toString() || "",
        descripcion: consolidatedDescription,
        cantidad: 1,
        valor_unitario: 0,
        precio_unitario: 0,
        subtotal: 0,
        sunat_concept_igv_type_id: gravadaType?.id || 0,
        igv: 0,
        total: 0,
      };

      form.setValue("items", [anticipoItem], { shouldValidate: false });
    } else {
      // MODO VENTA NORMAL: Crear items individuales
      const invoiceItems: ElectronicDocumentItemSchema[] = [];

      // Agregar items de mano de obra
      labours.forEach((labour) => {
        const totalCost = parseFloat(labour.total_cost || "0");
        const precio_unitario = totalCost;
        const valor_unitario = precio_unitario / (1 + porcentaje_de_igv / 100);
        const subtotal = valor_unitario;
        const igvAmount = subtotal * (porcentaje_de_igv / 100);

        invoiceItems.push({
          account_plan_id: QUOTATION_ACCOUNT_PLAN_IDS.FULL_SALE,
          unidad_de_medida: "ZZ", // Servicios
          codigo: labour.id.toString(),
          descripcion: labour.description,
          cantidad: 1,
          valor_unitario: valor_unitario,
          precio_unitario: precio_unitario,
          subtotal: subtotal,
          sunat_concept_igv_type_id: gravadaType?.id || 0,
          igv: igvAmount,
          total: totalCost,
        });
      });

      // Agregar items de repuestos
      parts.forEach((part) => {
        const totalAmount = parseFloat(part.total_amount || "0");
        const cantidad = part.quantity_used;
        const precio_unitario = totalAmount / cantidad;
        const valor_unitario = precio_unitario / (1 + porcentaje_de_igv / 100);
        const subtotal = valor_unitario * cantidad;
        const igvAmount = subtotal * (porcentaje_de_igv / 100);

        invoiceItems.push({
          account_plan_id: QUOTATION_ACCOUNT_PLAN_IDS.FULL_SALE,
          unidad_de_medida: "NIU", // Bienes
          codigo: part.id.toString(),
          descripcion: part.product_name,
          cantidad: cantidad,
          valor_unitario: valor_unitario,
          precio_unitario: precio_unitario,
          subtotal: subtotal,
          sunat_concept_igv_type_id: gravadaType?.id || 0,
          igv: igvAmount,
          total: totalAmount,
        });
      });

      // AGREGAR ITEMS DE REGULARIZACIÓN DE ANTICIPOS (solo anticipos reales con is_advance_payment = true)
      if (advances && advances.length > 0) {
        advances
          .filter((advance) => advance.is_advance_payment === true)
          .forEach((advance) => {
            // Calcular los valores base del anticipo para restar
            // IMPORTANTE: Convertir a número porque puede venir como string desde la API
            const total_con_igv = Number(advance.total) || 0;
            const precio_unitario = total_con_igv; // El anticipo es cantidad 1
            const valor_unitario =
              precio_unitario / (1 + porcentaje_de_igv / 100);
            const subtotal = valor_unitario;
            const igvAmount = subtotal * (porcentaje_de_igv / 100);

            // Crear item de regularización en NEGATIVO
            invoiceItems.push({
              account_plan_id: QUOTATION_ACCOUNT_PLAN_IDS.ADVANCE_PAYMENT,
              unidad_de_medida: "ZZ",
              codigo: advance.id?.toString(),
              descripcion: `ANTICIPO: ${advance.serie}-${advance.numero} DEL ${
                advance.fecha_de_emision
                  ? new Date(advance.fecha_de_emision).toLocaleDateString(
                      "es-PE",
                    )
                  : ""
              }`,
              cantidad: 1,
              valor_unitario: valor_unitario,
              precio_unitario: precio_unitario,
              subtotal: subtotal,
              sunat_concept_igv_type_id: gravadaType?.id || 0,
              igv: igvAmount,
              total: total_con_igv,
              anticipo_regularizacion: true,
              anticipo_documento_serie: advance.serie,
              anticipo_documento_numero: advance.numero,
              reference_document_id: advance.id?.toString(),
            });
          });
      }

      form.setValue("items", invoiceItems, { shouldValidate: false });
    }
  }, [
    labours,
    parts,
    advances,
    igvTypes,
    porcentaje_de_igv,
    isAdvancePayment,
    selectedGroupNumber,
    form,
  ]);

  // Observar items para re-calcular totales cuando cambien
  const watchedItems = form.watch("items");
  const items = useMemo(() => watchedItems || [], [watchedItems]);

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
        (t) => t.id === item.sunat_concept_igv_type_id,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario - 2/3 del ancho */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Financiera de la Orden de Trabajo */}
            <WorkOrderFinancialInfo
              labours={labours}
              parts={parts}
              advances={advances}
              currencySymbol={currencySymbol}
            />

            {/* Información del Documento */}
            <InvoiceDocumentInfoSection
              form={form}
              isEdit={isEdit}
              documentTypes={documentTypes}
              currencyTypes={currencyTypes}
              authorizedSeries={authorizedSeries}
              defaultCustomer={defaultCustomer!}
              isAdvancePayment={isAdvancePayment}
            />

            {/* Items (solo lectura, cargados automáticamente) */}
            <ItemsSection
              form={form}
              igvTypes={igvTypes}
              currencySymbol={currencySymbol}
              porcentaje_de_igv={porcentaje_de_igv}
              isAdvancePayment={isAdvancePayment}
              isFromQuotation={true}
            />

            {/* Configuración Adicional */}
            <AdditionalConfigSection
              form={form}
              checkbooks={checkbooks}
              isModuleCommercial={false}
            />
          </div>

          {/* Resumen - 1/3 del ancho */}
          <InvoiceSummarySection
            form={form}
            onCancel={onCancel}
            isPending={isPending}
            isEdit={isEdit}
            selectedGroupNumber={selectedGroupNumber}
            documentTypes={documentTypes}
            authorizedSeries={authorizedSeries}
            defaultCustomer={defaultCustomer!}
            currencySymbol={currencySymbol}
            totales={totales}
            porcentaje_de_igv={porcentaje_de_igv}
            isAdvancePayment={isAdvancePayment}
            advancePayments={advances}
          />
        </div>
      </form>
    </Form>
  );
}
