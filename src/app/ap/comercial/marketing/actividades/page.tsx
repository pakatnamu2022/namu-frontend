"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
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
import { ACTIVITIES } from "@/features/ap/comercial/marketing/actividades/lib/activities.constants";
import { useActivities } from "@/features/ap/comercial/marketing/actividades/lib/activities.hook";
import {
  changeActivityStatus,
  deleteActivities,
} from "@/features/ap/comercial/marketing/actividades/lib/activities.actions";
import ActivitiesActions from "@/features/ap/comercial/marketing/actividades/components/ActivitiesActions";
import ActivitiesTable from "@/features/ap/comercial/marketing/actividades/components/ActivitiesTable";
import { activitiesColumns } from "@/features/ap/comercial/marketing/actividades/components/ActivitiesColumns";
import ActivitiesOptions from "@/features/ap/comercial/marketing/actividades/components/ActivitiesOptions";
import ActivityLocationModal from "@/features/ap/comercial/marketing/actividades/components/ActivityLocationModal";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function MarketingActivitiesPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [locationActivityId, setLocationActivityId] = useState<number | null>(null);
  const { MODEL, ROUTE } = ACTIVITIES;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useActivities({ page, search, per_page });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteActivities(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleChangeStatus = async (id: number, status: string) => {
    try {
      await changeActivityStatus(id, status);
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
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
        <ActivitiesActions permissions={permissions} />
      </HeaderTableWrapper>
      <ActivitiesTable
        isLoading={isLoading}
        columns={activitiesColumns({
          onDelete: setDeleteId,
          onChangeStatus: handleChangeStatus,
          onAddLocation: setLocationActivityId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ActivitiesOptions search={search} setSearch={setSearch} />
      </ActivitiesTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <ActivityLocationModal
        activityId={locationActivityId}
        onOpenChange={(open) => !open && setLocationActivityId(null)}
        onSuccess={() => setLocationActivityId(null)}
      />

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
