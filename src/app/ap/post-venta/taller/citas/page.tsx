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
import { DEFAULT_PER_PAGE, EMPRESA_AP } from "@/core/core.constants";
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
import AppointmentCalendarView from "@/features/ap/post-venta/taller/citas/components/AppointmentCalendarView";
import { Button } from "@/components/ui/button";
import { Calendar, Table } from "lucide-react";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import { useAllWorkers } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";

export default function AppointmentPlanningPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const { MODEL, ROUTE, ROUTE_UPDATE } = APPOINTMENT_PLANNING;
  const permissions = useModulePermissions(ROUTE);
  const router = useNavigate();
  const currentDate = new Date();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(currentDate);
  const [dateTo, setDateTo] = useState<Date | undefined>(currentDate);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toISOString().split("T")[0] : undefined;
  };

  const { data: asesores = [], isLoading: isLoadingAsesores } = useAllWorkers({
    cargo_id: POSITION_TYPE.CONSULTANT,
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useAppointmentPlanning({
    page,
    search,
    per_page,
    date_appointment:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
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
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="flex items-center gap-2"
            >
              <Table className="h-4 w-4" />
              Tabla
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Calendario
            </Button>
          </div>
          <AppointmentPlanningActions permissions={permissions} />
        </div>
      </HeaderTableWrapper>

      {viewMode === "table" ? (
        <>
          <AppointmentPlanningTable
            isLoading={isLoading}
            columns={appointmentPlanningColumns({
              onDelete: setDeleteId,
              onUpdate: handleUpdate,
              permissions,
            })}
            data={data?.data || []}
          >
            <AppointmentPlanningOptions
              search={search}
              setSearch={setSearch}
              dateFrom={dateFrom}
              setDateFrom={setDateFrom}
              dateTo={dateTo}
              setDateTo={setDateTo}
            />
          </AppointmentPlanningTable>

          <DataTablePagination
            page={page}
            totalPages={data?.meta?.last_page || 1}
            totalData={data?.meta?.total || 0}
            onPageChange={setPage}
            per_page={per_page}
            setPerPage={setPerPage}
          />
        </>
      ) : (
        <AppointmentCalendarView
          asesores={asesores}
          isLoadingAsesores={isLoadingAsesores}
        />
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
