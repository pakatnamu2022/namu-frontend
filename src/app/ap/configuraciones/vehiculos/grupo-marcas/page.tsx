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
import BrandGroupActions from "@/features/ap/configuraciones/vehiculos/grupos-marcas/components/BrandGroupActions";
import BrandGroupTable from "@/features/ap/configuraciones/vehiculos/grupos-marcas/components/BrandGroupTable";
import { brandGroupColumns } from "@/features/ap/configuraciones/vehiculos/grupos-marcas/components/BrandGroupColumns";
import BrandGroupOptions from "@/features/ap/configuraciones/vehiculos/grupos-marcas/components/BrandGroupOptions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import BrandGroupModal from "@/features/ap/configuraciones/vehiculos/grupos-marcas/components/BrandGroupModal";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useBrandGroup } from "@/features/ap/configuraciones/vehiculos/grupos-marcas/lib/brandGroup.hook";
import {
  deleteBrandGroup,
  updateBrandGroup,
} from "@/features/ap/configuraciones/vehiculos/grupos-marcas/lib/brandGroup.actions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { BRAND_GROUP } from "@/features/ap/configuraciones/vehiculos/grupos-marcas/lib/brandGroup.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function BrandGroupPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = BRAND_GROUP;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useBrandGroup({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateBrandGroup(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBrandGroup(deleteId);
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
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Grupo de Marcas"}
          icon={currentView.icon}
        />
        <BrandGroupActions permissions={permissions} />
      </HeaderTableWrapper>
      <BrandGroupTable
        isLoading={isLoading}
        columns={brandGroupColumns({
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          onToggleStatus: handleToggleStatus,
          permissions,
        })}
        data={data?.data || []}
      >
        <BrandGroupOptions search={search} setSearch={setSearch} />
      </BrandGroupTable>

      {updateId !== null && (
        <BrandGroupModal
          id={updateId}
          title={"Actualizar Grupo de Marcas"}
          open={true}
          onClose={() => {
            setUpdateId(null);
          }}
          mode="update"
        />
      )}

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
