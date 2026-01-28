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
import { usePurchaseOrderProductsById } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.hook.ts";
import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft, Plus } from "lucide-react";
import { Card } from "@/components/ui/card.tsx";
import { PURCHASE_ORDER_PRODUCT } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.constants.ts";

export default function ReceptionsProductsPage() {
  const { checkRouteExists, isLoadingModule } = useCurrentModule();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE_ADD, ROUTE_UPDATE } = RECEPTION;
  const { ROUTE, ABSOLUTE_ROUTE } = PURCHASE_ORDER_PRODUCT;
  const permissions = useModulePermissions(ROUTE);
  const navigate = useNavigate();
  const { purchaseOrderId } = useParams<{ purchaseOrderId: string }>();
  const purchaseOrderIdNum = purchaseOrderId
    ? parseInt(purchaseOrderId)
    : undefined;

  const { data: purchaseOrder, isLoading: isLoadingPurchaseOrder } =
    usePurchaseOrderProductsById(purchaseOrderIdNum || 0);

  const { data, isLoading, refetch } = useAllReceptions({}, purchaseOrderIdNum);

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
    navigate(`${ROUTE_ADD}/${purchaseOrderId}`);
  };

  if (isLoadingModule || isLoadingPurchaseOrder) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!purchaseOrder) return <NotFound />;

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
              title={`Recepciones - ${purchaseOrder.number}`}
              subtitle="Gestión de recepciones de productos"
              icon="PackageCheck"
            />
          </div>
        </div>
        {permissions.canCreate && data && data.length === 0 && (
          <Button size="sm" variant="outline" onClick={handleAddReception}>
            <Plus className="size-4 mr-2" /> Agregar Recepción
          </Button>
        )}
      </HeaderTableWrapper>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Proveedor</p>
            <p className="font-semibold">{purchaseOrder.supplier}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Almacén</p>
            <p className="font-semibold">{purchaseOrder.warehouse || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Orden</p>
            <p className="font-semibold">
              {purchaseOrder.currency_code === "USD" ? "$" : "S/."}
              {purchaseOrder.total.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

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
            routeUpdate={`${ROUTE_UPDATE}/${purchaseOrderId}`}
            purchaseOrderNumber={purchaseOrder?.number}
            warehouseName={purchaseOrder?.warehouse}
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
