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
import BrandsActions from "@/features/ap/configuraciones/vehiculos/marcas/components/BrandsActions.tsx";
import BrandsTable from "@/features/ap/configuraciones/vehiculos/marcas/components/BrandsTable.tsx";
import { brandsColumns } from "@/features/ap/configuraciones/vehiculos/marcas/components/BrandsColumns.tsx";
import BrandOptions from "@/features/ap/configuraciones/vehiculos/marcas/components/BrandsOptions.tsx";
import { useBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.hook.ts";
import {
  deleteBrand,
  updateBrands,
} from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.actions.ts";
import { DEFAULT_PER_PAGE } from "@/core/core.constants.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { BRAND_POSTVENTA } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.constants.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

export default function BrandsPVPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = BRAND_POSTVENTA;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useBrands({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateBrands(id, {
        status: newStatus,
        type_operation_id: String(CM_POSTVENTA_ID),
      });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBrand(deleteId);
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
        <BrandsActions
          permissions={permissions}
          isCommercial={CM_POSTVENTA_ID}
        />
      </HeaderTableWrapper>
      <BrandsTable
        isLoading={isLoading}
        columns={brandsColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          permissions,
          isCommercial: CM_POSTVENTA_ID,
        })}
        data={data?.data || []}
      >
        <BrandOptions search={search} setSearch={setSearch} />
      </BrandsTable>

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
