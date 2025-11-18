"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleComponent from "@/shared/components/TitleComponent";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { SHOP } from "@/features/ap/configuraciones/ventas/tiendas/lib/shop.constants";
import { useShop } from "@/features/ap/configuraciones/ventas/tiendas/lib/shop.hook";
import {
  deleteShop,
  updateShop,
} from "@/features/ap/configuraciones/ventas/tiendas/lib/shop.actions";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import ShopActions from "@/features/ap/configuraciones/ventas/tiendas/components/ShopActions";
import ShopTable from "@/features/ap/configuraciones/ventas/tiendas/components/ShopTable";
import { shopColumns } from "@/features/ap/configuraciones/ventas/tiendas/components/ShopColumns";
import ShopOptions from "@/features/ap/configuraciones/ventas/tiendas/components/ShopOptions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import ShopModal from "@/features/ap/configuraciones/ventas/tiendas/components/ShopModal";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";


export default function ShopPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { ROUTE, MODEL } = SHOP;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useShop({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateShop(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteShop(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Tiendas"}
          icon={currentView.icon}
        />
        <ShopActions permissions={permissions} />
      </HeaderTableWrapper>
      <ShopTable
        isLoading={isLoading}
        columns={shopColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ShopOptions search={search} setSearch={setSearch} />
      </ShopTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <ShopModal
          id={updateId}
          title={"Actualizar Tienda"}
          open={true}
          onClose={() => {
            setUpdateId(null);
          }}
          mode="update"
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
