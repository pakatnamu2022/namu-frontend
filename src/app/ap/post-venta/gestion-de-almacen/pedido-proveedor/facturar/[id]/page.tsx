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
} from "@/core/core.function.ts";
import { useState } from "react";
import { PURCHASE_ORDER_PRODUCT } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.constants.ts";
import { useSupplierOrderById } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.hook.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { FileText } from "lucide-react";
import { SUPPLIER_ORDER } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.constants.ts";

export default function InvoiceSupplierOrderPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const router = useNavigate();
  const params = useParams();
  const supplierOrderId = params?.id ? Number(params.id) : 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { MODEL, ROUTE } = PURCHASE_ORDER_PRODUCT;
  const { ABSOLUTE_ROUTE } = SUPPLIER_ORDER;

  // Consultar el pedido a proveedor
  const {
    data: supplierOrder,
    isLoading: isLoadingSupplierOrder,
    error,
  } = useSupplierOrderById(supplierOrderId);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await storePurchaseOrderProducts(data);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
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

  if (isLoadingSupplierOrder) {
    return <PageSkeleton />;
  }

  if (error || !supplierOrder) {
    return (
      <div className="space-y-4">
        <TitleComponent
          title="Error"
          subtitle="No se pudo cargar el pedido a proveedor"
          icon="AlertCircle"
        />
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">
              {error?.message ||
                "El pedido a proveedor no existe o no se pudo cargar"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TitleComponent
        title={`Facturación de Orden - Pedido N° ${supplierOrder.order_number}`}
        subtitle="Registra la factura del proveedor y verifica los datos contra el pedido realizado"
        icon="FileCheck"
      />

      {/* Información del Pedido a Proveedor */}
      <div className="rounded-lg border bg-card p-5 lg:m-4">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Información del Pedido
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Proveedor
            </p>
            <p className="text-sm font-semibold text-foreground">
              {supplierOrder.supplier?.full_name}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">RUC</p>
            <p className="text-sm font-semibold text-foreground">
              {supplierOrder.supplier?.num_doc}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Fecha Pedido
            </p>
            <p className="text-sm font-semibold text-foreground">
              {supplierOrder.order_date}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Moneda</p>
            <p className="text-sm font-semibold text-foreground">
              {supplierOrder.type_currency?.name}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Tipo Abastecimiento
            </p>
            <p className="text-sm font-semibold text-foreground">
              {supplierOrder.supply_type}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario de Orden de Compra */}
      <PurchaseOrderProductsForm
        defaultValues={{
          supplier_id: supplierOrder.supplier_id.toString(),
          sede_id: supplierOrder.sede_id.toString(),
          warehouse_id: supplierOrder.warehouse_id.toString(),
          currency_id: supplierOrder.type_currency_id.toString(),
          emission_date: new Date(),
          due_date: new Date(),
          items:
            supplierOrder.details?.map((detail) => ({
              product_id: detail.product_id.toString(),
              quantity: Number(detail.quantity),
              unit_price: Number(detail.unit_price),
              item_total: Number(detail.total),
              discount: 0,
              tax_rate: 18,
              notes: detail.note || "",
            })) || [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="create"
        onCancel={handleCancel}
        supplierOrderId={supplierOrder.id}
        supplierOrderData={supplierOrder}
      />
    </div>
  );
}
