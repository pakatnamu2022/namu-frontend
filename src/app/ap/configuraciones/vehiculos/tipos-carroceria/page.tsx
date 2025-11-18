"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import { useBodyType } from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/lib/bodyType.hook";
import {
  deleteBodyType,
  updateBodyType,
} from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/lib/bodyType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleComponent from "@/shared/components/TitleComponent";
import BodyTypeActions from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/components/BodyTypeActions";
import BodyTypeTable from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/components/BodyTypeTable";
import { bodyTypeColumns } from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/components/BodyTypeColumns";
import BodyTypeOptions from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/components/BodyTypeOptions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import BodyTypeModal from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/components/BodyTypeModal";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { BODY_TYPE } from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/lib/bodyType.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";


export default function BodyTypePage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = BODY_TYPE;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useBodyType({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateBodyType(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBodyType(deleteId);
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
          subtitle={"Tipos de carrocería"}
          icon={currentView.icon}
        />
        <BodyTypeActions permissions={permissions} />
      </HeaderTableWrapper>
      <BodyTypeTable
        isLoading={isLoading}
        columns={bodyTypeColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <BodyTypeOptions search={search} setSearch={setSearch} />
      </BodyTypeTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <BodyTypeModal
          id={updateId}
          title={"Actualizar Tipo de carrocería"}
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
