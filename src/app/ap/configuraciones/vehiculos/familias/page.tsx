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
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { useFamilies } from "@/features/ap/configuraciones/vehiculos/familias/lib/families.hook";
import {
  deleteFamilies,
  updateFamilies,
} from "@/features/ap/configuraciones/vehiculos/familias/lib/families.actions";
import FamiliesActions from "@/features/ap/configuraciones/vehiculos/familias/components/FamiliesActions";
import FamiliesTable from "@/features/ap/configuraciones/vehiculos/familias/components/FamiliesTable";
import { familiesColumns } from "@/features/ap/configuraciones/vehiculos/familias/components/FamiliesColumns";
import FamiliesOptions from "@/features/ap/configuraciones/vehiculos/familias/components/FamiliesOptions";
import FamiliesModal from "@/features/ap/configuraciones/vehiculos/familias/components/FamiliesModal";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import DataTablePagination from "@/shared/components/DataTablePagination";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { FAMILIES } from "@/features/ap/configuraciones/vehiculos/familias/lib/families.constants";
import { useAllBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.hook";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function FamiliesPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<string>("");
  const { MODEL, ROUTE } = FAMILIES;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useFamilies({
    page,
    search,
    per_page,
    brand_id: brandId,
  });

  const { data: brands = [] } = useAllBrands();

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateFamilies(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFamilies(deleteId);
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
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Grupo de Familias"}
          icon={currentView.icon}
        />
        <FamiliesActions permissions={permissions} />
      </HeaderTableWrapper>
      <FamiliesTable
        isLoading={isLoading}
        columns={familiesColumns({
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          onToggleStatus: handleToggleStatus,
          permissions,
        })}
        data={data?.data || []}
      >
        <FamiliesOptions
          search={search}
          setSearch={setSearch}
          brands={brands}
          brandId={brandId}
          setBrandId={setBrandId}
        />
      </FamiliesTable>

      {updateId !== null && (
        <FamiliesModal
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
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </div>
  );
}
