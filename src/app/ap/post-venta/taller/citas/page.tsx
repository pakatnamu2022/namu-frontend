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
import { APPOINTMENT_PLANNING } from "@/features/ap/post-venta/taller/citas/lib/appointmentPlanning.constants";
import { useAppointmentPlanning } from "@/features/ap/post-venta/taller/citas/lib/appointmentPlanning.hook";
import { deleteAppointmentPlanning } from "@/features/ap/post-venta/taller/citas/lib/appointmentPlanning.actions";
import AppointmentPlanningActions from "@/features/ap/post-venta/taller/citas/components/AppointmentPlanningActions";
import AppointmentPlanningTable from "@/features/ap/post-venta/taller/citas/components/AppointmentPlanningTable";
import { appointmentPlanningColumns } from "@/features/ap/post-venta/taller/citas/components/AppointmentPlanningColumns";
import AppointmentPlanningOptions from "@/features/ap/post-venta/taller/citas/components/AppointmentPlanningOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { useNavigate } from "react-router-dom";

export default function AppointmentPlanningPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE, ROUTE_UPDATE } = APPOINTMENT_PLANNING;
  const permissions = useModulePermissions(ROUTE);
  const router = useNavigate();

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useAppointmentPlanning({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAppointmentPlanning(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleUpdate = (id: number) => {
    router(`${ROUTE_UPDATE}/${id}`);
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
        <AppointmentPlanningActions permissions={permissions} />
      </HeaderTableWrapper>
      <AppointmentPlanningTable
        isLoading={isLoading}
        columns={appointmentPlanningColumns({
          onDelete: setDeleteId,
          onUpdate: handleUpdate,
          permissions,
        })}
        data={data?.data || []}
      >
        <AppointmentPlanningOptions search={search} setSearch={setSearch} />
      </AppointmentPlanningTable>

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
