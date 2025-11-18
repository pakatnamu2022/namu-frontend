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
import { PERSON_SEGMENT } from "@/features/ap/configuraciones/maestros-general/segmentos-persona/lib/personSegment.constants";
import { usePersonSegment } from "@/features/ap/configuraciones/maestros-general/segmentos-persona/lib/personSegment.hook";
import {
  deletePersonSegment,
  updatePersonSegment,
} from "@/features/ap/configuraciones/maestros-general/segmentos-persona/lib/personSegment.actions";
import PersonSegmentActions from "@/features/ap/configuraciones/maestros-general/segmentos-persona/components/PersonSegmentActions";
import PersonSegmentTable from "@/features/ap/configuraciones/maestros-general/segmentos-persona/components/PersonSegmentTable";
import { personSegmentColumns } from "@/features/ap/configuraciones/maestros-general/segmentos-persona/components/PersonSegmentColumns";
import PersonSegmentOptions from "@/features/ap/configuraciones/maestros-general/segmentos-persona/components/PersonSegmentOptions";
import PersonSegmentModal from "@/features/ap/configuraciones/maestros-general/segmentos-persona/components/PersonSegmentModal";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";


export default function PersonSegmentPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = PERSON_SEGMENT;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = usePersonSegment({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updatePersonSegment(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePersonSegment(deleteId);
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
          subtitle={"Segmentos de Persona"}
          icon={currentView.icon}
        />
        <PersonSegmentActions permissions={permissions} />
      </HeaderTableWrapper>
      <PersonSegmentTable
        isLoading={isLoading}
        columns={personSegmentColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <PersonSegmentOptions search={search} setSearch={setSearch} />
      </PersonSegmentTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <PersonSegmentModal
          id={updateId}
          title={"Actualizar Segmento de Persona"}
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
