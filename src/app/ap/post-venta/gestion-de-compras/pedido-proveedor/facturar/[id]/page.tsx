"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { notFound } from "@/shared/hooks/useNotFound";
import { PurchaseOrderProductsForm } from "@/features/ap/post-venta/gestion-compras/factura-compra/components/PurchaseOrderProductsForm";
import { storePurchaseOrderProducts } from "@/features/ap/post-venta/gestion-compras/factura-compra/lib/purchaseOrderProducts.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { useState } from "react";
import { PURCHASE_ORDER_PRODUCT } from "@/features/ap/post-venta/gestion-compras/factura-compra/lib/purchaseOrderProducts.constants";
import { useSupplierOrderById } from "@/features/ap/post-venta/gestion-compras/pedido-proveedor/lib/supplierOrder.hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Package } from "lucide-react";

export default function InvoiceSupplierOrderPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const router = useNavigate();
  const params = useParams();
  const supplierOrderId = params?.id ? Number(params.id) : 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { MODEL, ROUTE, ABSOLUTE_ROUTE } = PURCHASE_ORDER_PRODUCT;

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Información del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nº Pedido:</span>
              <span className="font-semibold">
                {supplierOrder.order_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Proveedor:</span>
              <span className="font-medium">
                {supplierOrder.supplier?.full_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">RUC:</span>
              <span>{supplierOrder.supplier?.num_doc}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha Pedido:</span>
              <span>{supplierOrder.order_date}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Detalles de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sede:</span>
              <span className="font-medium">
                {supplierOrder.sede?.abreviatura}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Almacén:</span>
              <span className="font-medium">
                {supplierOrder.warehouse?.description}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Moneda:</span>
              <span>{supplierOrder.type_currency?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo Abast.:</span>
              <span>{supplierOrder.supply_type}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulario de Orden de Compra */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de la Factura del Proveedor</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
