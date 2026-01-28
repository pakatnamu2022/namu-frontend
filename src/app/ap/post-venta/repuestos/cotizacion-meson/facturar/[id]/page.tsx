"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ElectronicDocumentSchema,
  type ElectronicDocumentSchema as ElectronicDocumentSchemaType,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.schema";
import { OrderQuotationBillingForm } from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/OrderQuotationBillingForm";
import { useOrderQuotationById } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.hook";
import { storeElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import { ELECTRONIC_DOCUMENT } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ORDER_QUOTATION_MESON } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";

export default function BillOrderQuotationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const quotationId = id ? parseInt(id) : 0;
  const { ABSOLUTE_ROUTE } = ORDER_QUOTATION_MESON;

  const { data: quotation, isLoading: isLoadingQuotation } =
    useOrderQuotationById(quotationId);

  const form = useForm<ElectronicDocumentSchemaType>({
    resolver: zodResolver(ElectronicDocumentSchema) as any,
    defaultValues: {
      origin_module: "posventa",
      origin_entity_type: "order_quotation",
      origin_entity_id: quotationId.toString(),
      sunat_concept_document_type_id: "",
      serie: "",
      numero: "",
      sunat_concept_transaction_type_id: "",
      client_id: quotation?.vehicle?.owner?.id?.toString() || "",
      fecha_de_emision: new Date().toISOString().split("T")[0],
      sunat_concept_currency_id: "",
      tipo_de_cambio: 1,
      total: 0,
      total_gravada: 0,
      total_inafecta: 0,
      total_exonerada: 0,
      total_igv: 0,
      total_gratuita: 0,
      total_anticipo: 0,
      items: [],
      condiciones_de_pago: "",
      medio_de_pago: "",
      enviar_automaticamente_a_la_sunat: false,
      enviar_automaticamente_al_cliente: false,
      is_advance_payment: false,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: storeElectronicDocument,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(ELECTRONIC_DOCUMENT.MODEL, "create"));
      // Invalidar la query de la cotización para refrescar los anticipos
      queryClient.invalidateQueries({
        queryKey: ["orderQuotation", quotationId],
      });
      navigate(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(ELECTRONIC_DOCUMENT.MODEL, "create", msg));
    },
  });

  const onSubmit = (data: ElectronicDocumentSchemaType) => {
    // Calcular el saldo pendiente de la cotización
    const totalCotizacion = quotation?.total_amount || 0;
    const totalAnticiposAnteriores = quotation?.advances
      ? quotation.advances.reduce(
          (sum, advance) => sum + (advance.total || 0),
          0,
        )
      : 0;
    const saldoPendiente = totalCotizacion - totalAnticiposAnteriores;

    // Validar que no se pueda crear un anticipo con monto 0
    if (data.is_advance_payment && data.total === 0) {
      errorToast("No se puede crear un anticipo con monto S/ 0.00");
      return;
    }

    // Validar que el anticipo no exceda el saldo pendiente
    if (data.is_advance_payment && data.total > saldoPendiente) {
      const currencySymbol = quotation?.type_currency?.symbol || "S/";
      errorToast(
        `El anticipo no puede exceder el saldo pendiente de ${currencySymbol} ${saldoPendiente.toLocaleString(
          "es-PE",
          {
            minimumFractionDigits: 2,
          },
        )}`,
      );
      return;
    }

    // Convertir fecha_de_emision al formato correcto YYYY-MM-DD
    let fechaFormateada = data.fecha_de_emision;
    const fechaValue = data.fecha_de_emision as any;

    if (fechaValue instanceof Date) {
      // Si es un objeto Date, convertir a ISO y extraer la fecha
      fechaFormateada = fechaValue.toISOString().split("T")[0];
    } else if (typeof fechaValue === "string") {
      // Si es un string, intentar parsearlo y convertirlo
      const fecha = new Date(fechaValue);
      if (!isNaN(fecha.getTime())) {
        fechaFormateada = fecha.toISOString().split("T")[0];
      }
    }

    const formattedData = {
      ...data,
      fecha_de_emision: fechaFormateada,
    };

    mutate(formattedData);
  };

  const handleGoBack = () => {
    navigate(ABSOLUTE_ROUTE);
  };

  if (isLoadingQuotation) {
    return <PageSkeleton />;
  }

  if (!quotation) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Cotización no encontrada</h1>
          <p className="text-muted-foreground">
            La cotización que intentas facturar no existe.
          </p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a cotizaciones
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleGoBack}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <TitleComponent
          title="Facturar Cotización"
          subtitle={`Cotización: ${quotation.quotation_number}`}
        />
      </div>

      <OrderQuotationBillingForm
        form={form}
        onSubmit={onSubmit}
        isPending={isPending}
        quotation={quotation}
      />
    </div>
  );
}
