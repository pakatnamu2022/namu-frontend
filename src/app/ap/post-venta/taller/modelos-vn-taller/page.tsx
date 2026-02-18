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
import { useModelsVn } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook.ts";
import {
  deleteModelsVn,
  updateModelsVn,
} from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.actions.ts";
import ModelsVnActions from "@/features/ap/configuraciones/vehiculos/modelos-vn/components/ModelsVnActions.tsx";
import ModelsVnTable from "@/features/ap/configuraciones/vehiculos/modelos-vn/components/ModelsVnTable.tsx";
import { modelsVnColumns } from "@/features/ap/configuraciones/vehiculos/modelos-vn/components/ModelsVnColumns.tsx";
import ModelsVnOptions from "@/features/ap/configuraciones/vehiculos/modelos-vn/components/ModelsVnOptions.tsx";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { MODELS_VN_POSTVENTA } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.constanst.ts";
import { useAllBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.hook.ts";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

export default function ModelsVnPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<string>("");
  const { ROUTE, MODEL } = MODELS_VN_POSTVENTA;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useModelsVn({
    page,
    search,
    per_page,
    family$brand_id: brandId,
  });

  const { data: brands = [] } = useAllBrands();

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateModelsVn(id, {
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
      await deleteModelsVn(deleteId);
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
        <ModelsVnActions
          permissions={permissions}
          isCommercial={CM_POSTVENTA_ID}
        />
      </HeaderTableWrapper>
      <ModelsVnTable
        isLoading={isLoading}
        columns={modelsVnColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          permissions,
          isCommercial: CM_POSTVENTA_ID,
        })}
        data={data?.data || []}
      >
        <ModelsVnOptions
          search={search}
          setSearch={setSearch}
          brands={brands}
          brandId={brandId}
          setBrandId={setBrandId}
        />
      </ModelsVnTable>

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
