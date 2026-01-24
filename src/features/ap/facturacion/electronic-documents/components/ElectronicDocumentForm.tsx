"use client";

import { useState, useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import {
  ElectronicDocumentSchema,
  ElectronicDocumentItemSchema,
} from "../lib/electronicDocument.schema";
import {
  DEFAULT_IGV_PERCENTAGE,
  NUBEFACT_CODES,
  QUOTATION_ACCOUNT_PLAN_IDS,
} from "../lib/electronicDocument.constants";
import { useAuthorizedSeries } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import {
  useNextCorrelativeElectronicDocument,
  useAdvancePaymentsByQuotation,
} from "../lib/electronicDocument.hook";
import {
  useAllPurchaseRequestQuote,
  usePurchaseRequestQuoteById,
} from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.hook";
import { DocumentInfoSection } from "./sections/DocumentInfoSection";
import { QuotationSection } from "./sections/QuotationSection";
import { QuotationFinancialInfo } from "./sections/QuotationFinancialInfo";
import { ItemsSection } from "./sections/ItemsSection";
import { AdditionalConfigSection } from "./sections/AdditionalConfigSection";
import { SummarySection } from "./sections/SummarySection";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { useAllApBank } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { SUNAT_TYPE_INVOICES_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

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
  detractionTypes?: SunatConceptsResource[];
  creditNoteTypes?: SunatConceptsResource[];
  debitNoteTypes?: SunatConceptsResource[];
  useQuotation?: boolean; // Mostrar select de cotizaciones
}

export function ElectronicDocumentForm({
  form,
  onSubmit,
  isPending,
  isEdit = false,
  documentTypes = [],
  transactionTypes = [],
  identityDocumentTypes = [],
  currencyTypes = [],
  igvTypes = [],
  useQuotation = false,
}: ElectronicDocumentFormProps) {
  // Estados para manejar la cotización seleccionada
  const [selectedQuotationId, setSelectedQuotationId] = useState<number | null>(
    null,
  );

  // Estado para el cliente seleccionado (manejado por DocumentInfoSection)
  const [selectedCustomer, setSelectedCustomer] = useState<
    CustomersResource | undefined
  >(undefined);

  // Ref para rastrear la última cotización cargada (evitar loops)
  const lastLoadedQuotationId = useRef<number | null>(null);
  const lastLoadedAdvancePaymentState = useRef<boolean | null>(null);
  // Ref para evitar procesar anticipos múltiples veces por la misma cotización + modo
  // Guardamos una key en formato `${quotationId}:total` o `${quotationId}:advance`
  const processedAdvancePaymentsForQuotationKey = useRef<string | null>(null);

  // Fetch todas las cotizaciones disponibles
  const { data: quotations = [], isLoading: isLoadingQuotations } =
    useAllPurchaseRequestQuote({
      status: "approved", // Solo cotizaciones aprobadas
      // has_vehicle: 1,
      is_approved: 1,
      is_paid: 0, // Solo cotizaciones no pagadas
    });

  // Fetch la cotización seleccionada
  const { data: quotation } = usePurchaseRequestQuoteById(
    selectedQuotationId || 0,
  );

  // Obtener anticipos previos de la cotización
  const vehicleId = quotation?.ap_vehicle_id || null;
  const hasVehicle = !!vehicleId;
  const { data: advancePaymentsResponse, isLoading: isLoadingAdvancePayments } =
    useAdvancePaymentsByQuotation(selectedQuotationId);

  const items = form.watch("items") || [];
  // OBJECTS
  const selectedCurrency = currencyTypes.find(
    (c) => c.id === Number(form.watch("sunat_concept_currency_id")),
  );

  // ID
  const selectedSeriesId = form.watch("serie");
  const selectedDocumentType = form.watch("sunat_concept_document_type_id");
  const purchaseRequestQuoteId = form.watch("purchase_request_quote_id");
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

  // Calcular porcentaje de IGV desde el cliente seleccionado
  const porcentaje_de_igv =
    selectedCustomer?.tax_class_type_igv || DEFAULT_IGV_PERCENTAGE;

  // Obtener datos de anticipos desde la respuesta
  const advancePayments = advancePaymentsResponse?.documents || [];

  // Calcular el saldo pendiente
  // Siempre usar quotation como fuente de verdad para el precio
  // Si hay anticipos, restar el total_amount
  const quotationPrice = quotation ? quotation.doc_sale_price : 0;
  const totalAdvancesAmount = advancePaymentsResponse
    ? advancePaymentsResponse.total_amount || 0
    : 0;
  const pendingBalance = quotationPrice - totalAdvancesAmount;

  // Sincronizar el campo del formulario con el estado local
  useEffect(() => {
    if (purchaseRequestQuoteId) {
      setSelectedQuotationId(parseInt(purchaseRequestQuoteId));
      // resetear tracking de procesamiento cuando se selecciona nueva cotización
      processedAdvancePaymentsForQuotationKey.current = null;
    } else {
      setSelectedQuotationId(null);
    }
  }, [purchaseRequestQuoteId]);

  // Forzar anticipo cuando la cotización no tiene vehículo
  useEffect(() => {
    if (quotation && !hasVehicle) {
      const currentValue = form.getValues("is_advance_payment");
      if (!currentValue) {
        form.setValue("is_advance_payment", true);
      }
    }
  }, [quotation, hasVehicle, form]);

  // Asignar ap_vehicle_id cuando hay cotización con vehículo
  useEffect(() => {
    if (quotation && hasVehicle && vehicleId) {
      const currentValue = form.getValues("ap_vehicle_id");
      if (currentValue !== vehicleId.toString()) {
        form.setValue("ap_vehicle_id", vehicleId.toString());
      }
    } else if (!quotation || !hasVehicle) {
      const currentValue = form.getValues("ap_vehicle_id");
      if (currentValue !== undefined) {
        form.setValue("ap_vehicle_id", undefined);
      }
    }
  }, [quotation, hasVehicle, vehicleId, form]);

  // Limpiar campos cuando se deselecciona la cotización
  useEffect(() => {
    if (!selectedQuotationId) {
      // eslint-disable-next-line react-hooks/immutability
      resetData();
    }
  }, [selectedQuotationId, form]);

  const resetData = () => {
    lastLoadedQuotationId.current = null;
    lastLoadedAdvancePaymentState.current = null;
    processedAdvancePaymentsForQuotationKey.current = null;
    // Limpiar cliente
    form.setValue("client_id", "");
    // Limpiar items
    form.setValue("items", []);
    // Limpiar moneda
    form.setValue("sunat_concept_currency_id", "");
  };

  // Cambiar tipo de operación según si es anticipo o no
  useEffect(() => {
    const currentValue = form.getValues("sunat_concept_transaction_type_id");
    // Cuando cambia el modo de anticipo/venta total, permitir re-procesar anticipos
    processedAdvancePaymentsForQuotationKey.current = null;

    if (isAdvancePayment) {
      // Anticipo: code_nubefact "04" - Venta Interna - Anticipos (id: 36)
      const anticipoType = transactionTypes.find(
        (type) => type.code_nubefact === "04",
      );
      if (anticipoType && currentValue !== anticipoType.id.toString()) {
        form.setValue(
          "sunat_concept_transaction_type_id",
          anticipoType.id.toString(),
        );
      }
    } else if (advancePayments.length > 0) {
      // Normal: code_nubefact "04" - Venta Interna (id: 36)
      const regularizationType = transactionTypes.find(
        (type) => type.code_nubefact === "04",
      );
      if (
        regularizationType &&
        currentValue !== regularizationType.id.toString()
      ) {
        form.setValue(
          "sunat_concept_transaction_type_id",
          regularizationType.id.toString(),
        );
      }
    } else {
      // Normal: code_nubefact "01" - Venta Interna (id: 33)
      const normalType = transactionTypes.find(
        (type) => type.code_nubefact === "01",
      );
      if (normalType && currentValue !== normalType.id.toString()) {
        form.setValue(
          "sunat_concept_transaction_type_id",
          normalType.id.toString(),
        );
      }
    }
  }, [isAdvancePayment, advancePayments, transactionTypes, form, quotation]);

  // Efecto para cargar moneda SOLO cuando cambia la cotización
  // Nota: El cliente se carga y se setea en DocumentInfoSection via onCustomerChange
  useEffect(() => {
    if (quotation && quotation.id !== lastLoadedQuotationId.current) {
      // Marcar esta cotización como cargada
      lastLoadedQuotationId.current = quotation.id;

      // Moneda
      if (quotation.doc_type_currency_id) {
        const currencyId = currencyTypes.find(
          (c) => c.currency_type === quotation.doc_type_currency_id,
        )?.id;
        form.setValue(
          "sunat_concept_currency_id",
          currencyId?.toString() || "",
        );
      }
    }
  }, [quotation, form, currencyTypes]);

  // Efecto separado para cargar items (se ejecuta cuando cambia cotización O isAdvancePayment)
  useEffect(() => {
    if (
      quotation &&
      (quotation.id !== lastLoadedQuotationId.current ||
        isAdvancePayment !== lastLoadedAdvancePaymentState.current)
    ) {
      form.setValue("items", []);
      // Marcar este estado como procesado
      lastLoadedAdvancePaymentState.current = isAdvancePayment;

      // Si cambió el modo de anticipo, resetear el tracking de anticipos procesados
      // para que se vuelvan a actualizar cuando se cambie de anticipo → venta total
      processedAdvancePaymentsForQuotationKey.current = null;
      // Crear item con el vehículo
      if (quotation.ap_model_vn) {
        // IMPORTANTE:
        // - Para VENTA TOTAL: usar el PRECIO COMPLETO de la cotización
        //   Los items de regularización (anticipos previos) se restan como ítems separados
        //   Item vehículo: $22,000
        //   Items anticipos: -$10,000, -$5,000
        //   Total neto = $22,000 - $10,000 - $5,000 = $7,000
        // - Para ANTICIPO: usar el máximo disponible (pendingBalance)
        //   Deja $1 reservado para la factura final
        //   El usuario puede modificar el monto si desea anticipar menos
        const effectivePrice = isAdvancePayment
          ? Math.max(pendingBalance, 0) // Máximo disponible para anticipo
          : quotationPrice; // Para venta total, siempre usar precio completo
        const cantidad = 1;

        // Calcular descuentos negativos totales (con IGV)
        // SOLO aplicar descuento si NO es anticipo
        const negativeDiscounts = !isAdvancePayment
          ? quotation.bonus_discounts?.reduce((total, discount) => {
              if (discount.is_negative) {
                const valor =
                  discount.type === "PORCENTAJE"
                    ? (parseFloat(quotation.base_selling_price) *
                        parseFloat(discount.percentage)) /
                      100
                    : parseFloat(discount.amount);
                return total + valor;
              }
              return total;
            }, 0) || 0
          : 0;

        // Según SUNAT:
        // precio_unitario = precio CON IGV (sin descuento aplicado, es el precio base del vehículo)
        // valor_unitario = precio SIN IGV (sin descuento aplicado)
        // descuento = descuento SIN IGV
        // IMPORTANTE:
        // - Si es ANTICIPO: usar directamente effectivePrice (ya tiene descuento aplicado, no mostrar descuento)
        // - Si es VENTA TOTAL: reconstruir precio base sumando descuento para mostrar el descuento en el item
        const precio_base_con_igv = !isAdvancePayment
          ? effectivePrice + negativeDiscounts // Venta total: reconstruir precio base
          : effectivePrice; // Anticipo: usar precio con descuento ya aplicado
        const precio_unitario = precio_base_con_igv / cantidad;
        const valor_unitario = precio_unitario / (1 + porcentaje_de_igv / 100);

        // Calcular descuento sin IGV (solo para venta total)
        const descuento_sin_igv = !isAdvancePayment
          ? negativeDiscounts / (1 + porcentaje_de_igv / 100)
          : 0;

        // Subtotal = valor_unitario - descuento
        const subtotal = valor_unitario * cantidad - descuento_sin_igv; // Base imponible
        const igvAmount = subtotal * (porcentaje_de_igv / 100);

        // Construir descripción base del vehículo
        let descripcion = "";

        // Si es anticipo, usar descripción simple
        if (isAdvancePayment) {
          descripcion = `ANTICIPO DE CLIENTE`;
        } else {
          // Si es venta total, usar formato detallado SUNAT
          const vehicle = quotation.ap_vehicle;
          descripcion = `VENTA DE VEHICULO
AÑO MODELO: ${vehicle?.year || ""}
SERIE: ${vehicle?.vin || ""}
MOTOR: ${vehicle?.engine_number || ""}
MARCA: ${vehicle?.model?.brand || ""}
CARROCERIA: ${vehicle?.vin || ""}
NUM. EJES: ${vehicle?.model?.axles_number || ""}
VERSION: ${vehicle?.model?.version || ""}
NUM. ASIENTOS: ${vehicle?.model?.seats_number || ""}
CAP. PASAJEROS: ${vehicle?.model?.passengers_number || ""}
VIN: ${vehicle?.vin || ""}
CARGA UTIL: ${vehicle?.model?.payload || ""}
COMBUSTIBLE: ${vehicle?.model?.fuel || ""}
ALTO: ${vehicle?.model?.height || ``}
LARGO: ${vehicle?.model?.length || ``}
ANCHO: ${vehicle?.model?.width || ``}
NUM. DE CILINDROS: ${vehicle?.model?.cylinders_number || ``}
CILINDRADA: ${vehicle?.model?.displacement || ``}
MODELO: ${vehicle?.model?.version || ``}
`;
        }

        const vehicleItem: ElectronicDocumentItemSchema = {
          account_plan_id: isAdvancePayment
            ? QUOTATION_ACCOUNT_PLAN_IDS.ADVANCE_PAYMENT
            : QUOTATION_ACCOUNT_PLAN_IDS.FULL_SALE,
          unidad_de_medida: "NIU",
          codigo: quotation.ap_vehicle_id?.toString() || undefined,
          descripcion,
          cantidad: 1,
          valor_unitario: valor_unitario,
          precio_unitario: precio_unitario,
          descuento: descuento_sin_igv > 0 ? descuento_sin_igv : undefined,
          subtotal: subtotal,
          sunat_concept_igv_type_id:
            igvTypes.find(
              (t) => t.code_nubefact === NUBEFACT_CODES.GRAVADA_ONEROSA,
            )?.id || 0,
          igv: igvAmount,
          total: subtotal + igvAmount,
        };

        // Si es anticipo, actualizar información adicional
        if (isAdvancePayment) {
          vehicleItem.anticipo_regularizacion = false;
        }

        form.setValue("items", [vehicleItem]);
      }

      // NOTA: el agregado de anticipos puede depender de una carga asíncrona
      // de `advancePayments`. Para evitar condiciones de carrera, delegamos
      // el agregado de anticipos a un efecto separado que se dispara cuando
      // `advancePayments` termina de cargarse.
    }
  }, [
    quotation,
    form,
    igvTypes,
    porcentaje_de_igv,
    isAdvancePayment,
    advancePayments,
    isLoadingAdvancePayments,
    pendingBalance,
  ]);

  // Efecto separado para procesar y actualizar anticipos cuando la consulta termine
  useEffect(() => {
    if (!quotation) return;
    if (isAdvancePayment) return; // sólo aplica para venta total
    if (isLoadingAdvancePayments) return; // esperar a que termine la carga
    if (!advancePayments || advancePayments.length === 0) return;
    const processedKey = `${quotation.id}:total`;
    // Si ya procesamos anticipos para esta cotización en modo 'total', salimos
    if (processedAdvancePaymentsForQuotationKey.current === processedKey)
      return; // ya procesado

    const advanceItems: ElectronicDocumentItemSchema[] = advancePayments.map(
      (advance) => {
        const advanceTotal = Number(advance.total) || 0;
        const cantidad = 1;
        // Según SUNAT para anticipos (regularización):
        // precio_unitario = precio CON IGV (negativo para restar)
        // valor_unitario = precio SIN IGV (negativo para restar)
        const precio_unitario = advanceTotal / cantidad; // Precio CON IGV
        const valor_unitario = precio_unitario / (1 + porcentaje_de_igv / 100); // Precio SIN IGV
        const subtotal = valor_unitario * cantidad; // Base imponible
        const igvAmount = subtotal * (porcentaje_de_igv / 100);

        return {
          reference_document_id: advance.id.toString(),
          account_plan_id: QUOTATION_ACCOUNT_PLAN_IDS.ADVANCE_PAYMENT,
          unidad_de_medida: "NIU",
          descripcion: `ANTICIPO: ${advance.serie}-${advance.numero}`,
          cantidad: cantidad,
          valor_unitario: valor_unitario,
          precio_unitario: precio_unitario,
          subtotal: subtotal,
          sunat_concept_igv_type_id:
            igvTypes.find(
              (t) => t.code_nubefact === NUBEFACT_CODES.GRAVADA_ONEROSA,
            )?.id || 0,
          igv: igvAmount,
          total: subtotal + igvAmount,
          anticipo_regularizacion: true,
          anticipo_documento_serie: advance.serie,
          anticipo_documento_numero: Number(advance.numero),
        };
      },
    );

    const currentItems = form.getValues("items") || [];
    form.setValue("items", [...currentItems, ...advanceItems]);

    // Marcar como procesado para esta cotización en modo 'total'
    processedAdvancePaymentsForQuotationKey.current = processedKey;
  }, [
    advancePayments,
    isLoadingAdvancePayments,
    quotation,
    isAdvancePayment,
    igvTypes,
    porcentaje_de_igv,
    form,
  ]);

  // Calcular totales
  const calcularTotales = () => {
    let total_gravada = 0;
    let total_inafecta = 0;
    let total_exonerada = 0;
    let total_igv = 0;
    let total_gratuita = 0;
    let total_anticipo = 0; // Total de anticipos (regularizaciones) - subtotal sin IGV

    items.forEach((item) => {
      const igvType = igvTypes.find(
        (t) => t.id === item.sunat_concept_igv_type_id,
      );

      if (igvType?.code_nubefact === "1") {
        // Gravado
        if (item.anticipo_regularizacion) {
          if (item.reference_document_id) {
            const advancePayment = advancePayments.find(
              (ap) => ap.id === Number(item.reference_document_id),
            );
            if (
              advancePayment &&
              advancePayment.sunat_concept_document_type_id ===
                SUNAT_TYPE_INVOICES_ID.NOTA_CREDITO
            ) {
              total_gravada += item.subtotal;
              total_anticipo += -item.subtotal;
            } else {
              total_gravada += -item.subtotal;
              total_anticipo += item.subtotal;
            }
          } else {
            total_gravada += -item.subtotal;
            total_anticipo += item.subtotal;
          }
        } else {
          // Gravado normal
          total_gravada += item.subtotal;
        }
      } else if (igvType?.code_nubefact === "20") {
        if (item.anticipo_regularizacion) {
          // Exonerado
          total_exonerada += item.subtotal;
          total_anticipo += item.subtotal;
        } else {
          // Exonerado normal
          total_exonerada += item.subtotal;
        }
      } else if (igvType?.code_nubefact === "30") {
        if (item.anticipo_regularizacion) {
          total_anticipo += item.subtotal;
        } else {
          // Inafecto
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

    // Calcular IGV sobre la base imponible neta (después de restar anticipos)
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
  };

  const totales = calcularTotales();

  // Actualizar form values cuando cambien los cálculos
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
  }, [
    items,
    porcentaje_de_igv,
    form,
    totales.total_gravada,
    totales.total_inafecta,
    totales.total_exonerada,
    totales.total_igv,
    totales.total_gratuita,
    totales.total_anticipo,
    totales.total,
  ]);

  const series = form.watch("serie");

  // Solo consultar el siguiente correlativo cuando NO está en modo edición
  const { data: nextNumber } = useNextCorrelativeElectronicDocument(
    !isEdit && selectedDocumentType ? Number(selectedDocumentType) : 0,
    !isEdit && series ? Number(series) : 0,
  );

  const { data: checkbooks = [] } = useAllApBank({
    /*  */ currency_id: selectedCurrency?.currency_type,
    sede_id: selectedSeries?.sede_id,
  });

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

  if (useQuotation && isLoadingQuotations) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario - 2/3 del ancho */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vincular con Cotización - Solo si useQuotation es true */}
            {useQuotation && (
              <QuotationSection form={form} quotations={quotations} />
            )}

            {/* Información Financiera de la Cotización */}
            {quotation && selectedQuotationId && (
              <QuotationFinancialInfo
                quotation={quotation}
                advances={advancePayments}
                currencySymbol={currencySymbol}
              />
            )}

            {/* Información del Documento */}
            <DocumentInfoSection
              form={form}
              isEdit={isEdit}
              documentTypes={documentTypes}
              authorizedSeries={authorizedSeries}
              isAdvancePayment={isAdvancePayment}
              currencyTypes={currencyTypes}
              isFromQuotation={!!selectedQuotationId}
              hasVehicle={hasVehicle}
              defaultCustomerId={
                quotation?.holder_id ? Number(quotation.holder_id) : null
              }
              onCustomerChange={setSelectedCustomer}
            />

            {/* Agregar Items */}
            <ItemsSection
              form={form}
              igvTypes={igvTypes}
              currencySymbol={currencySymbol}
              porcentaje_de_igv={porcentaje_de_igv}
              isAdvancePayment={isAdvancePayment}
              maxAdvanceAmount={
                selectedQuotationId && isAdvancePayment
                  ? Math.max(pendingBalance, 0)
                  : undefined
              }
              isFromQuotation={!!selectedQuotationId}
              useQuotation={useQuotation}
            />

            {/* Configuración Adicional */}
            <AdditionalConfigSection form={form} checkbooks={checkbooks} />
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
            isAdvancePayment={isAdvancePayment}
            quotation={quotation}
            advancePayments={advancePayments}
          />
        </div>

        {/* <pre>
          <code>{JSON.stringify(form.getValues(), null, 2)}</code>
        </pre> */}

        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        {/* <Button onClick={() => form.trigger()}>Trigger Form</Button> */}
      </form>
    </Form>
  );
}
