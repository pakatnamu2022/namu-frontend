"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { PurchaseOrderProductsForm } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/components/PurchaseOrderProductsForm.tsx";
import { storePurchaseOrderProducts } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.actions.ts";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
  formatDate,
} from "@/core/core.function.ts";
import { useState } from "react";
import { PURCHASE_ORDER_PRODUCT } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.constants.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { FileText, Package, TruckIcon } from "lucide-react";
import { useReceptionById } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.hook.ts";
import { Badge } from "@/components/ui/badge.tsx";

export default function InvoiceReceptionPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const router = useNavigate();
  const params = useParams();
  const receptionId = params?.receptionId ? Number(params.receptionId) : 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { MODEL, ROUTE } = PURCHASE_ORDER_PRODUCT;

  // Consultar la recepción
  const {
    data: reception,
    isLoading: isLoadingReception,
    error,
  } = useReceptionById(receptionId);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Agregar el ID de la recepción al payload
      const payload = {
        ...data,
        purchase_reception_id: receptionId,
      };
      await storePurchaseOrderProducts(payload);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(-1);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router(-1);
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  if (isLoadingReception) {
    return <PageSkeleton />;
  }

  if (error || !reception) {
    return (
      <div className="space-y-4">
        <TitleComponent
          title="Error"
          subtitle="No se pudo cargar la recepción"
          icon="AlertCircle"
        />
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">
              {error?.message || "La recepción no existe o no se pudo cargar"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar si ya tiene factura
  if (reception.has_invoice) {
    return (
      <div className="space-y-4">
        <TitleComponent
          title="Factura ya registrada"
          subtitle="Esta recepción ya tiene una factura asociada"
          icon="AlertCircle"
        />
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              La guía de remisión {reception.shipping_guide_number} ya tiene una
              factura registrada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TitleComponent
        title={`Facturación de Guía de Remisión - ${reception.shipping_guide_number || reception.reception_number}`}
        subtitle="Registra la factura del proveedor asociada a esta guía de remisión"
        icon="FileCheck"
      />

      {/* Información de la Recepción */}
      <div className="rounded-lg border bg-card p-5 lg:m-4">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Información de la Recepción
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Número de Recepción
            </p>
            <p className="text-sm font-semibold text-foreground">
              {reception.reception_number || `#${reception.id}`}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Guía de Remisión
            </p>
            <Badge variant="default" className="text-sm">
              {reception.shipping_guide_number || "Sin guía"}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Fecha de Recepción
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatDate(reception.reception_date)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Almacén</p>
            <p className="text-sm font-semibold text-foreground">
              {reception.warehouse?.description || "N/A"}
            </p>
          </div>
          {reception.carrier && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TruckIcon className="size-3" />
                Transportista
              </p>
              <p className="text-sm font-semibold text-foreground">
                {reception.carrier.full_name}
              </p>
              {reception.carrier.num_doc && (
                <p className="text-xs text-muted-foreground">
                  RUC: {reception.carrier.num_doc}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Información del Proveedor de la Orden */}
      {reception.purchase_order && (
        <div className="rounded-lg border bg-card p-5 lg:m-4">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Información del Proveedor
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Proveedor
              </p>
              <p className="text-sm font-semibold text-foreground">
                {reception.purchase_order.supplier}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">RUC</p>
              <p className="text-sm font-semibold text-foreground">
                {reception.purchase_order.supplier_num_doc}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Sede</p>
              <Badge variant="outline">{reception.purchase_order.sede}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Moneda
              </p>
              <Badge variant="outline">
                {reception.purchase_order.currency_code}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Orden de Compra */}
      <PurchaseOrderProductsForm
        defaultValues={{
          supplier_id: String(reception.supplier_id) || "",
          sede_id: String(reception.warehouse.sede_id) || "",
          warehouse_id: reception.warehouse_id.toString(),
          currency_id: String(reception.type_currency_id) || "",
          emission_date: new Date(),
          due_date: new Date(),
          payment_terms: "30_DAYS",
          items:
            reception.details?.map((detail) => ({
              product_id: detail.product_id.toString(),
              quantity:
                Number(detail.quantity_received) +
                Number(detail.observed_quantity),
              unit_price: Number(detail.product?.cost_price || 0),
              item_total:
                Number(detail.quantity_received) *
                Number(detail.product?.cost_price || 0),
              discount: 0,
              tax_rate: 18,
              notes: detail.notes || "",
              product_name: detail.product?.name || "",
              product_code: detail.product?.code || "",
              product_unit_measurement:
                detail.product?.unit_measurement_name || "",
            })) || [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="create"
        onCancel={handleCancel}
        receptionData={reception}
      />
    </div>
  );
}
