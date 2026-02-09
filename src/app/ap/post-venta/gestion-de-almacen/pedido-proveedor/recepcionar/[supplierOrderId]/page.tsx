"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog.tsx";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import NotFound from "@/app/not-found.tsx";
import { useAllReceptions } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.hook.ts";
import { deleteReception } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.actions.ts";
import ReceptionsProductsTable from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/components/ReceptionsProductsTable.tsx";
import ReceptionsProductsCards from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/components/ReceptionsProductsCards.tsx";
import { RECEPTION } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.constants.ts";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import {
  ArrowLeft,
  Plus,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card.tsx";
import { useSupplierOrderById } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.hook";
import { SUPPLIER_ORDER } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.constants";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge.tsx";

export default function ReceptionsProductsPage() {
  const { checkRouteExists, isLoadingModule } = useCurrentModule();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE_ADD, ROUTE_UPDATE } = RECEPTION;
  const { ROUTE, ABSOLUTE_ROUTE } = SUPPLIER_ORDER;
  const permissions = useModulePermissions(ROUTE);
  const navigate = useNavigate();
  const { supplierOrderId } = useParams<{ supplierOrderId: string }>();
  const supplierOrderIdNum = supplierOrderId
    ? parseInt(supplierOrderId)
    : undefined;

  const { data: supplierOrder, isLoading: isLoadingSupplierOrder } =
    useSupplierOrderById(supplierOrderIdNum || 0);

  const { data, isLoading, refetch } = useAllReceptions({}, supplierOrderIdNum);

  // Calcular el total de facturas de todas las recepciones
  const invoicesTotals = useMemo(() => {
    if (!data) return { total: 0, count: 0 };

    const total = data.reduce((sum, reception) => {
      if (reception.purchase_order) {
        return sum + Number(reception.purchase_order.total);
      }
      return sum;
    }, 0);

    const count = data.filter((r) => r.purchase_order).length;

    return { total, count };
  }, [data]);

  // Comparar totales
  const comparison = useMemo(() => {
    if (!supplierOrder)
      return {
        difference: 0,
        isExact: true,
        hasInvoices: false,
        orderTotal: 0,
      };

    const orderTotal = Number(supplierOrder.total_amount);
    const difference = invoicesTotals.total - orderTotal;
    const isExact = Math.abs(difference) < 0.01; // Tolerancia de 1 centavo
    const hasInvoices = invoicesTotals.count > 0;

    return { difference, isExact, hasInvoices, orderTotal };
  }, [supplierOrder, invoicesTotals]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReception(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleBack = () => {
    navigate(ABSOLUTE_ROUTE);
  };

  const handleAddReception = () => {
    navigate(`${ROUTE_ADD}/${supplierOrderId}`);
  };

  if (isLoadingModule || isLoadingSupplierOrder) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!supplierOrder) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <TitleComponent
              title={`Recepciones - ${supplierOrder.order_number}`}
              subtitle="Gestión de recepciones de productos"
              icon="PackageCheck"
            />
          </div>
        </div>
        {permissions.canCreate && (
          <Button size="sm" variant="outline" onClick={handleAddReception}>
            <Plus className="size-4 mr-2" /> Agregar Recepción
          </Button>
        )}
      </HeaderTableWrapper>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Proveedor</p>
            <p className="font-semibold">{supplierOrder.supplier?.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Almacén</p>
            <p className="font-semibold">
              {supplierOrder.warehouse?.description || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Orden</p>
            <p className="font-semibold">
              {supplierOrder.type_currency?.symbol}
              {Number(supplierOrder.total_amount).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* Comparativa de Montos */}
      {comparison.hasInvoices && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-3">
                Comparativa de Montos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total del Pedido */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    Total Pedido Original
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {supplierOrder.type_currency?.symbol}
                    {comparison.orderTotal.toFixed(2)}
                  </p>
                </div>

                {/* Total Facturado */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    Total Facturado ({invoicesTotals.count}{" "}
                    {invoicesTotals.count === 1 ? "factura" : "facturas"})
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {supplierOrder.type_currency?.symbol}
                    {invoicesTotals.total.toFixed(2)}
                  </p>
                </div>

                {/* Diferencia */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    Diferencia
                  </p>
                  <div className="flex items-center gap-2">
                    {comparison.isExact ? (
                      <>
                        <CheckCircle className="size-5 text-green-600" />
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Correcto
                        </Badge>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-5 text-amber-600" />
                        <div>
                          <Badge
                            variant="outline"
                            color={comparison.difference > 0 ? "red" : "green"}
                          >
                            {comparison.difference > 0 ? "+" : ""}
                            {supplierOrder.type_currency?.symbol}
                            {Math.abs(comparison.difference).toFixed(2)}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {comparison.difference > 0
                              ? "Se está cobrando de más"
                              : "Hay un descuento aplicado"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <ReceptionsProductsTable
        isLoading={isLoading}
        data={data!}
        customContent={
          <ReceptionsProductsCards
            data={data!}
            onDelete={setDeleteId}
            permissions={{
              canUpdate: permissions.canUpdate,
              canDelete: permissions.canDelete,
            }}
            routeUpdate={`${ROUTE_UPDATE}/${supplierOrderId}`}
            routeInvoice={`${ABSOLUTE_ROUTE}/recepcionar/facturar`}
            supplierOrderNumber={supplierOrder.order_number}
            warehouseName={supplierOrder?.warehouse?.description || ""}
          />
        }
      ></ReceptionsProductsTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
