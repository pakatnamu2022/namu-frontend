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
import { useNextCorrelativeElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import { OrderQuotationDocumentInfoSection } from "./OrderQuotationDocumentInfoSection";
import { ItemsSection } from "@/features/ap/facturacion/electronic-documents/components/sections/ItemsSection";
import { AdditionalConfigSection } from "@/features/ap/facturacion/electronic-documents/components/sections/AdditionalConfigSection";
import { useCustomersById } from "@/features/ap/comercial/clientes/lib/customers.hook";
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
        (concept) => concept.type === SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE,
      ),
    [sunatConcepts],
  );

  const transactionTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) =>
          concept.type === SUNAT_CONCEPTS_TYPE.BILLING_TRANSACTION_TYPE,
      ),
    [sunatConcepts],
  );

  const currencyTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) => concept.type === SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY,
      ),
    [sunatConcepts],
  );

  const igvTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) => concept.type === SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE,
      ),
    [sunatConcepts],
  );

  // OBJECTS
  const selectedCurrency = currencyTypes.find(
    (c) => c.id === Number(form.watch("sunat_concept_currency_id")),
  );

  // ID
  const selectedSeriesId = form.watch("serie");
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const clientId = form.watch("client_id");
  const isAdvancePayment = form.watch("is_advance_payment") || false;

  // Consultar series autorizadas
  const { data: authorizedSeries = [] } = useAuthorizedSeries({
    type_receipt_id: documentTypes.find(
      (dt) => dt.id.toString() === selectedDocumentType,
    )?.tribute_code,
  });

  const selectedSeries = authorizedSeries.find(
    (s) => s.id.toString() === selectedSeriesId,
  );

  // Obtener el cliente seleccionado solo por ID (eficiente, sin traer 2000+ clientes)
  // Si el usuario cambia el cliente, se trae solo ese cliente específico
  const { data: selectedCustomerFromApi } = useCustomersById(
    clientId ? Number(clientId) : 0,
  );

  // Usar el cliente de la API si existe, sino usar el owner de la cotización como fallback
  const selectedCustomer = selectedCustomerFromApi || quotation?.vehicle?.owner;

  // Calcular porcentaje de IGV desde el cliente seleccionado
  const porcentaje_de_igv =
    selectedCustomer?.tax_class_type_igv || DEFAULT_IGV_PERCENTAGE;

  // Calcular el saldo pendiente usando TODOS los pagos previos
  // Esto incluye tanto anticipos (is_advance_payment = true) como ventas internas completas (is_advance_payment = false)
  const quotationPrice = quotation ? quotation.total_amount : 0;
  const totalAdvancesAmount = quotation?.advances
    ? quotation.advances.reduce((sum, advance) => sum + (advance.total || 0), 0)
    : 0;
  const pendingBalance = quotationPrice - totalAdvancesAmount;

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
      // Verificar si hay anticipos previos en la cotización
      const hasAdvances = quotation?.advances?.some(
        (advance) => advance.is_advance_payment === true,
      );

      if (hasAdvances) {
        // Venta final con anticipos: code_nubefact "04" - Venta Interna - Anticipos (ID 36)
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
        // Venta completa sin anticipos: code_nubefact "01" - Venta Interna (ID 33)
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
  }, [isAdvancePayment, transactionTypes, quotation?.advances, form]);

  // Efecto para cargar datos de la cotización
  useEffect(() => {
    // Esperar a que currencyTypes esté cargado antes de procesar
    if (!quotation || currencyTypes.length === 0) return;

    if (quotation.id !== lastLoadedQuotationId.current) {
      lastLoadedQuotationId.current = quotation.id;
      currencyAlreadySet.current = false; // Reset cuando cambia la cotización

      // Setear el ID de la cotización de orden (order_quotation_id)
      form.setValue("order_quotation_id", quotation.id.toString(), {
        shouldValidate: false,
      });

      // NOTA: El cliente se setea en OrderQuotationDocumentInfoSection
      // a través de defaultCustomer para evitar race conditions con FormSelectAsync

      // Mapear moneda de la cotización con la moneda de SUNAT usando el tribute_code
      if (quotation.type_currency?.id && !currencyAlreadySet.current) {
        const matchedCurrency = currencyTypes.find(
          (c) => c.tribute_code === String(quotation.type_currency.id),
        );

        if (matchedCurrency) {
          form.setValue(
            "sunat_concept_currency_id",
            matchedCurrency.id.toString(),
            { shouldValidate: false },
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
            { shouldValidate: false },
          );
          currencyAlreadySet.current = true;
        }
      }
    }
  }, [quotation?.id, currencyTypes, form]);

  // Efecto para cargar items cuando cambia la cotización o isAdvancePayment
  useEffect(() => {
    if (!quotation || igvTypes.length === 0) {
      return;
    }

    // Verificar si ya se procesó esta combinación específica
    const shouldSkip =
      quotation.id === lastLoadedQuotationId.current &&
      isAdvancePayment === lastLoadedAdvancePaymentState.current &&
      JSON.stringify(quotation.advances) ===
        processedAdvancePaymentsForQuotationKey.current;

    if (shouldSkip) {
      return;
    }

    lastLoadedAdvancePaymentState.current = isAdvancePayment;
    processedAdvancePaymentsForQuotationKey.current = JSON.stringify(
      quotation.advances,
    );

    // Crear items desde los detalles de la cotización
    if (quotation.details && quotation.details.length > 0) {
      if (isAdvancePayment) {
        // CONSOLIDAR ITEMS EN UNO SOLO PARA ANTICIPO
        // Concatenar los nombres de todos los productos
        const productNames = quotation.details
          .map((detail) => detail.description || "SERVICIO DE TALLER")
          .join(", ");

        // Crear un solo item consolidado con valores en 0 para que el usuario los edite
        const quotationItems: ElectronicDocumentItemSchema[] = [
          {
            account_plan_id: QUOTATION_ACCOUNT_PLAN_IDS.ADVANCE_PAYMENT,
            unidad_de_medida: "NIU",
            codigo: quotation.id?.toString(),
            descripcion: `ANTICIPO POR ${productNames}`,
            cantidad: 1,
            valor_unitario: 0,
            precio_unitario: 0,
            subtotal: 0,
            sunat_concept_igv_type_id:
              igvTypes.find(
                (t) => t.code_nubefact === NUBEFACT_CODES.GRAVADA_ONEROSA,
              )?.id || 0,
            igv: 0,
            total: 0,
          },
        ];

        // NO AGREGAR ANTICIPOS PREVIOS EN MODO ANTICIPO
        // Los anticipos solo se deben mostrar cuando es una venta final (isAdvancePayment = false)

        form.setValue("is_advance_payment", true, { shouldValidate: false });
        form.setValue("items", quotationItems, { shouldValidate: false });
      } else {
        // ITEMS NORMALES (SIN CONSOLIDAR)
        const quotationItems: ElectronicDocumentItemSchema[] =
          quotation.details.map((detail) => {
            const cantidad = Number(detail.quantity) || 1;
            // IMPORTANTE: Convertir a número porque puede venir como string desde la API
            // El total_amount de la cotización es el SUBTOTAL (sin IGV)
            const subtotalDetail = Number(detail.total_amount) || 0;

            // El valor_unitario y precio_unitario son iguales (sin IGV)
            const valor_unitario = subtotalDetail / cantidad;
            const precio_unitario =
              valor_unitario * (1 + porcentaje_de_igv / 100);

            const subtotal = subtotalDetail;
            const igvAmount = subtotal * (porcentaje_de_igv / 100);
            const total = subtotal + igvAmount; // Total CON IGV

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
                  (t) => t.code_nubefact === NUBEFACT_CODES.GRAVADA_ONEROSA,
                )?.id || 0,
              igv: igvAmount,
              total: total,
            };
          });

        // AGREGAR ITEMS DE REGULARIZACIÓN DE ANTICIPOS (solo anticipos reales con is_advance_payment = true)
        if (quotation.advances && quotation.advances.length > 0) {
          quotation.advances
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
              quotationItems.push({
                account_plan_id: QUOTATION_ACCOUNT_PLAN_IDS.ADVANCE_PAYMENT,
                unidad_de_medida: "ZZ",
                codigo: advance.id?.toString(),
                descripcion: `ANTICIPO: ${advance.serie}-${
                  advance.numero
                } DEL ${
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
                sunat_concept_igv_type_id:
                  igvTypes.find(
                    (t) => t.code_nubefact === NUBEFACT_CODES.GRAVADA_ONEROSA,
                  )?.id || 0,
                igv: igvAmount,
                total: total_con_igv,
                anticipo_regularizacion: true,
                anticipo_documento_serie: advance.serie,
                anticipo_documento_numero: advance.numero,
                reference_document_id: advance.id?.toString(),
              });
            });
        }

        form.setValue("items", quotationItems, { shouldValidate: false });
      }
    }
  }, [
    quotation?.id,
    quotation?.details,
    quotation?.advances,
    igvTypes,
    porcentaje_de_igv,
    isAdvancePayment,
    form,
  ]);

  // Observar items para re-calcular totales cuando cambien
  const items = form.watch("items") || [];

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

    // Redondeamos a 2 decimales
    total_gravada = parseFloat(total_gravada.toFixed(2));
    total_inafecta = parseFloat(total_inafecta.toFixed(2));
    total_exonerada = parseFloat(total_exonerada.toFixed(2));
    total_gratuita = parseFloat(total_gratuita.toFixed(2));
    total_anticipo = parseFloat(total_anticipo.toFixed(2));

    total_igv = parseFloat(
      (total_gravada * (porcentaje_de_igv / 100)).toFixed(2),
    );
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
    !isEdit && series ? Number(series) : 0,
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
                advances={quotation.advances}
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
              defaultCustomer={quotation.client}
              hasSufficientStock={quotation.has_sufficient_stock}
              pendingBalance={pendingBalance}
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
              isFromQuotation={true}
              showActions={false}
            />

            {/* Configuración Adicional */}
            <AdditionalConfigSection
              form={form}
              checkbooks={checkbooks}
              isModuleCommercial={false}
            />
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
            advancePayments={quotation?.advances || []}
          />
        </div>
      </form>
    </Form>
  );
}
