"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { TYPE_GENDER } from "@/features/ap/configuraciones/maestros-general/tipos-sexo/lib/typesGender.constants";
import { useTypeGender } from "@/features/ap/configuraciones/maestros-general/tipos-sexo/lib/typesGender.hook";
import {
  deleteTypeGender,
  updateTypeGender,
} from "@/features/ap/configuraciones/maestros-general/tipos-sexo/lib/typesGender.actions";
import TypeGenderActions from "@/features/ap/configuraciones/maestros-general/tipos-sexo/components/TypesGenderActions";
import TypeGenderTable from "@/features/ap/configuraciones/maestros-general/tipos-sexo/components/TypesGenderTable";
import { typeGenderColumns } from "@/features/ap/configuraciones/maestros-general/tipos-sexo/components/TypesGenderColumns";
import TypeGenderOptions from "@/features/ap/configuraciones/maestros-general/tipos-sexo/components/TypesGenderOptions";
import TypeGenderModal from "@/features/ap/configuraciones/maestros-general/tipos-sexo/components/TypesGenderModal";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function TypeGenderPage() {
  
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = TYPE_GENDER;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useTypeGender({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateTypeGender(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTypeGender(deleteId);
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
          subtitle={"Tipos de sexo"}
          icon={currentView.icon}
        />
        <TypeGenderActions permissions={permissions} />
      </HeaderTableWrapper>
      <TypeGenderTable
        isLoading={isLoading}
        columns={typeGenderColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <TypeGenderOptions search={search} setSearch={setSearch} />
      </TypeGenderTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <TypeGenderModal
          id={updateId}
          title={"Actualizar Tipo de sexo"}
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
