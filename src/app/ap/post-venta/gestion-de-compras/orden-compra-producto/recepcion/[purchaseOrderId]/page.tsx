"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from "@/app/not-found";
import { useAllReceptions } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.hook";
import { deleteReception } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.actions";
import ReceptionsProductsTable from "@/features/ap/post-venta/gestion-compras/recepciones-producto/components/ReceptionsProductsTable";
import ReceptionsProductsCards from "@/features/ap/post-venta/gestion-compras/recepciones-producto/components/ReceptionsProductsCards";
import ReceptionsProductsOptions from "@/features/ap/post-venta/gestion-compras/recepciones-producto/components/ReceptionsProductsOptions";
import { RECEPTION } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.constants";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchaseOrderProductsById } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.hook";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";

export default function ReceptionsProductsPage() {
  const { checkRouteExists, isLoadingModule } = useCurrentModule();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE_ADD, ROUTE_UPDATE } = RECEPTION;
  const permissions = useModulePermissions("orden-compra-producto");
  const navigate = useNavigate();
  const { purchaseOrderId } = useParams<{ purchaseOrderId: string }>();
  const purchaseOrderIdNum = purchaseOrderId
    ? parseInt(purchaseOrderId)
    : undefined;

  const { data: purchaseOrder, isLoading: isLoadingPurchaseOrder } =
    usePurchaseOrderProductsById(purchaseOrderIdNum || 0);

  const { data, isLoading, refetch } = useAllReceptions(
    { search },
    purchaseOrderIdNum
  );

  // Filtrar los datos según el search
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;

    const searchLower = search.toLowerCase();
    return data.filter((reception) => {
      return (
        reception.reception_number?.toLowerCase().includes(searchLower) ||
        reception.shipping_guide_number?.toLowerCase().includes(searchLower) ||
        reception.received_by_user_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [data, search]);

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
    navigate("/ap/post-venta/gestion-de-compras/orden-compra-producto");
  };

  const handleAddReception = () => {
    navigate(`${ROUTE_ADD}/${purchaseOrderId}`);
  };

  if (isLoadingModule || isLoadingPurchaseOrder) return <PageSkeleton />;
  if (!checkRouteExists("orden-compra-producto")) return <NotFound />;
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
            <p className="font-semibold">{purchaseOrder.supplier}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Almacén</p>
            <p className="font-semibold">{purchaseOrder.warehouse || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Orden</p>
            <p className="font-semibold">S/ {purchaseOrder.total.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      <ReceptionsProductsTable
        isLoading={isLoading}
        data={filteredData}
        customContent={
          <ReceptionsProductsCards
            data={filteredData}
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
      >
        <ReceptionsProductsOptions search={search} setSearch={setSearch} />
      </ReceptionsProductsTable>

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
