"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { regularizeAdvancePayment } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions.ts";
import { RegularizeAdvancePaymentSchema } from "@/features/ap/facturacion/electronic-documents/lib/regularizeAdvancePayment.schema.ts";
import { RegularizeAdvancePaymentFormValues } from "@/features/ap/facturacion/electronic-documents/lib/regularizeAdvancePaymentForm.types.ts";
import { RegularizeAdvancePaymentForm } from "@/features/ap/facturacion/electronic-documents/components/RegularizeAdvancePaymentForm.tsx";
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import { ELECTRONIC_DOCUMENT_CAJA } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants.ts";
import { SUNAT_CONCEPTS_TYPE } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants.ts";
import { useAllSunatConcepts } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.hook.ts";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { useMemo } from "react";
import PageWrapper from "@/shared/components/PageWrapper.tsx";

export default function AddRegularizeAdvancePaymentCajaPage() {
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = ELECTRONIC_DOCUMENT_CAJA;
  const router = useNavigate();
  const { currentView, checkRouteExists, isLoadingModule } = useCurrentModule();

  const { data: sunatConcepts = [], isLoading: isLoadingSunatConcepts } =
    useAllSunatConcepts({
      type: [
        SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE,
        SUNAT_CONCEPTS_TYPE.BILLING_CURRENCY,
        SUNAT_CONCEPTS_TYPE.BILLING_IGV_TYPE,
      ],
    });

  const documentTypes = useMemo(
    () =>
      sunatConcepts.filter(
        (concept) => concept.type === SUNAT_CONCEPTS_TYPE.BILLING_DOCUMENT_TYPE,
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

  const form = useForm<RegularizeAdvancePaymentFormValues>({
    resolver: zodResolver(RegularizeAdvancePaymentSchema as any),
    defaultValues: {
      sunat_concept_document_type_id: "",
      sede_id: "",
      serie: "",
      numero: 0,
      origin_entity_type: "",
      order_quotation_id: "",
      work_order_id: "",
      client_id: "",
      fecha_de_emision: new Date().toISOString().split("T")[0],
      sunat_concept_currency_id: "",
      total: 0,
      items: [],
      condiciones_de_pago: "EFECTIVO",
      bank_id: "",
      operation_number: "",
    },
    mode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RegularizeAdvancePaymentFormValues) => {
      const payload: RegularizeAdvancePaymentSchema = {
        sunat_concept_document_type_id: data.sunat_concept_document_type_id,
        sede_id: data.sede_id,
        serie: data.serie,
        numero: data.numero,
        client_id: data.client_id,
        fecha_de_emision: data.fecha_de_emision,
        fecha_de_vencimiento: data.fecha_de_vencimiento,
        sunat_concept_currency_id: data.sunat_concept_currency_id,
        total_gravada: data.total_gravada,
        total_inafecta: data.total_inafecta,
        total_exonerada: data.total_exonerada,
        total_igv: data.total_igv,
        total: data.total,
        origin_entity_type: data.origin_entity_type || undefined,
        origin_entity_id: data.origin_entity_id,
        order_quotation_id: data.order_quotation_id,
        work_order_id: data.work_order_id,
        observaciones: data.observaciones,
        condiciones_de_pago: data.condiciones_de_pago,
        medio_de_pago: data.medio_de_pago,
        bank_id: data.bank_id,
        operation_number: data.operation_number,
        orden_compra_servicio: data.orden_compra_servicio,
        items: data.items.map((item) => ({
          account_plan_id: item.account_plan_id,
          unidad_de_medida: item.unidad_de_medida,
          codigo: item.codigo,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          valor_unitario: item.valor_unitario,
          precio_unitario: item.precio_unitario,
          descuento: item.descuento,
          subtotal: item.subtotal,
          sunat_concept_igv_type_id: item.sunat_concept_igv_type_id,
          igv: item.igv,
          total: item.total,
        })),
      };
      return regularizeAdvancePayment(payload);
    },
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: RegularizeAdvancePaymentFormValues) => {
    mutate(data);
  };

  if (isLoadingModule) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  if (isLoadingSunatConcepts) {
    return <FormSkeleton />;
  }

  return (
    <PageWrapper>
      <TitleFormComponent
        title="Regularización de Anticipos"
        mode="create"
        icon={currentView.icon}
        backRoute={ABSOLUTE_ROUTE}
      />
      <RegularizeAdvancePaymentForm
        form={form}
        onSubmit={handleSubmit}
        isPending={isPending}
        documentTypes={documentTypes || []}
        currencyTypes={currencyTypes || []}
        igvTypes={igvTypes || []}
      />
    </PageWrapper>
  );
}
