"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useMemo, useState } from "react";
import { errorToast, successToast } from "@/core/core.function.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { PRODUCT_SHELF } from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.constants.ts";
import {
  useProductShelfById,
  useShelfProducts,
} from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.hook.ts";
import {
  assignShelfProducts,
  removeShelfProduct,
} from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.actions.ts";
import ShelfAssignedProducts from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/components/ShelfAssignedProducts.tsx";
import ShelfProductPicker from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/components/ShelfProductPicker.tsx";

export default function ManageShelfProductsPage() {
  const router = useNavigate();
  const { id } = useParams<{ id: string }>();
  const shelfId = Number(id);
  const { isLoadingModule, currentView } = useCurrentModule();
  const { ABSOLUTE_ROUTE } = PRODUCT_SHELF;

  const [isAssigning, setIsAssigning] = useState(false);
  const [removingStockId, setRemovingStockId] = useState<number | null>(null);

  const {
    data: shelf,
    isLoading: isLoadingShelf,
    isError: isErrorShelf,
  } = useProductShelfById(shelfId);

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useShelfProducts(shelfId, { enabled: !!shelfId });

  const assignedStockIds = useMemo(
    () => new Set(products.map((p) => p.product_warehouse_stock_id)),
    [products],
  );

  const handleAssign = async (
    items: { product_warehouse_stock_id: number; position?: string }[],
  ) => {
    if (items.length === 0) return;
    setIsAssigning(true);
    try {
      await assignShelfProducts({
        product_shelf_id: shelfId,
        products: items,
      });
      await refetchProducts();
      successToast("Productos asignados al estante correctamente.");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ||
          "Error al asignar los productos al estante.",
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdatePosition = async (stockId: number, position: string) => {
    setIsAssigning(true);
    try {
      await assignShelfProducts({
        product_shelf_id: shelfId,
        products: [
          {
            product_warehouse_stock_id: stockId,
            position: position || undefined,
          },
        ],
      });
      await refetchProducts();
      successToast("Posición actualizada correctamente.");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al actualizar la posición.",
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (stockId: number) => {
    setRemovingStockId(stockId);
    try {
      await removeShelfProduct({
        product_shelf_id: shelfId,
        product_warehouse_stock_id: stockId,
      });
      await refetchProducts();
      successToast("Producto quitado del estante.");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ||
          "Error al quitar el producto del estante.",
      );
    } finally {
      setRemovingStockId(null);
    }
  };

  if (isLoadingModule || isLoadingShelf) return <PageSkeleton />;
  if (!currentView) notFound();
  if (isErrorShelf || !shelf) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={`Organizar: ${shelf.label}`}
          subtitle={`${shelf.code} · Almacén: ${shelf.warehouse}`}
          icon="LayoutGrid"
          onBack={() => router(ABSOLUTE_ROUTE)}
        >
          <Badge color={shelf.status ? "default" : "secondary"}>
            {shelf.status ? "Activo" : "Inactivo"}
          </Badge>
        </TitleComponent>
      </HeaderTableWrapper>

      {shelf.notes && (
        <p className="text-sm text-muted-foreground border rounded-md bg-muted/30 px-3 py-2">
          <span className="font-medium">Notas:</span> {shelf.notes}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <ShelfAssignedProducts
          products={products}
          isLoading={isLoadingProducts}
          onRemove={handleRemove}
          onUpdatePosition={handleUpdatePosition}
          removingStockId={removingStockId}
        />
        <ShelfProductPicker
          warehouseId={shelf.warehouse_id}
          assignedStockIds={assignedStockIds}
          onAssign={handleAssign}
          isAssigning={isAssigning}
        />
      </div>
    </div>
  );
}
