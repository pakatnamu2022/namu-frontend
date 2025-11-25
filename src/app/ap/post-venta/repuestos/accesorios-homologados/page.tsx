"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog.tsx";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { DEFAULT_PER_PAGE } from "@/core/core.constants.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { APPROVED_ACCESSORIES } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.constants.ts";
import { useApprovedAccesories } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.hook.ts";
import {
  deleteApprovedAccesories,
  updateApprovedAccesories,
} from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.actions.ts";
import { approvedAccesoriesColumns } from "@/features/ap/post-venta/repuestos/accesorios-homologados/components/ApprovedAccessoriesColumns.tsx";
import ApprovedAccesoriesOptions from "@/features/ap/post-venta/repuestos/accesorios-homologados/components/ApprovedAccessoriesOptions.tsx";
import ApprovedAccesoriesTable from "@/features/ap/post-venta/repuestos/accesorios-homologados/components/ApprovedAccessoriesTable.tsx";
import ApprovedAccesoriesActions from "@/features/ap/post-venta/repuestos/accesorios-homologados/components/ApprovedAccessoriesActions.tsx";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";


export default function ApprovedAccesoriesPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = APPROVED_ACCESSORIES;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useApprovedAccesories({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateApprovedAccesories(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteApprovedAccesories(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
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
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <ApprovedAccesoriesActions permissions={permissions} />
      </HeaderTableWrapper>
      <ApprovedAccesoriesTable
        isLoading={isLoading}
        columns={approvedAccesoriesColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ApprovedAccesoriesOptions search={search} setSearch={setSearch} />
      </ApprovedAccesoriesTable>

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
