"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from "@/app/not-found";
import { useReceptions } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.hook";
import { deleteReception } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.actions";
import ReceptionsProductsTable from "@/features/ap/post-venta/gestion-compras/recepciones-producto/components/ReceptionsProductsTable";
import { receptionsProductsColumns } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/components/ReceptionsProductsColumns";
import ReceptionsProductsOptions from "@/features/ap/post-venta/gestion-compras/recepciones-producto/components/ReceptionsProductsOptions";
import { RECEPTION } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.constants";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchaseOrderProductsById } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.hook";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function ReceptionsProductsPage() {
  const { checkRouteExists, isLoadingModule } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
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

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useReceptions(
    {
      page,
      search,
      per_page,
    },
    purchaseOrderIdNum
  );

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

  const handleView = (id: number) => {
    console.log("Ver recepción:", id);
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
              title={`Recepciones - ${purchaseOrder.order_number}`}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Proveedor</p>
            <p className="font-semibold">{purchaseOrder.supplier_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Almacén</p>
            <p className="font-semibold">
              {purchaseOrder.warehouse_name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Orden</p>
            <p className="font-semibold">
              S/ {purchaseOrder.total_amount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estado</p>
            <Badge className="capitalize">{purchaseOrder.status}</Badge>
          </div>
        </div>
      </Card>

      <ReceptionsProductsTable
        isLoading={isLoading}
        columns={receptionsProductsColumns({
          onDelete: setDeleteId,
          onView: handleView,
          permissions,
          routeUpdate: `${ROUTE_UPDATE}/${purchaseOrderId}`,
        })}
        data={data?.data || []}
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

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
