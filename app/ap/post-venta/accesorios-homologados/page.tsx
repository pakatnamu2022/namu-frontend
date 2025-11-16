"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { APPROVED_ACCESSORIES } from "@/src/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.constants";
import { useApprovedAccesories } from "@/src/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.hook";
import {
  deleteApprovedAccesories,
  updateApprovedAccesories,
} from "@/src/features/ap/post-venta/accesorios-homologados/lib/approvedAccessories.actions";
import { approvedAccesoriesColumns } from "@/src/features/ap/post-venta/accesorios-homologados/components/ApprovedAccessoriesColumns";
import ApprovedAccesoriesOptions from "@/src/features/ap/post-venta/accesorios-homologados/components/ApprovedAccessoriesOptions";
import ApprovedAccesoriesTable from "@/src/features/ap/post-venta/accesorios-homologados/components/ApprovedAccessoriesTable";
import ApprovedAccesoriesActions from "@/src/features/ap/post-venta/accesorios-homologados/components/ApprovedAccessoriesActions";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

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
