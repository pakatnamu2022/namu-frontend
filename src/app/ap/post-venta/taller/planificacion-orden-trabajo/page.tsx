"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { Button } from "@/components/ui/button";
import {
  Plus,
  LayoutDashboard,
  Calendar as CalendarIcon,
  List,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetWorkOrderPlanning,
  useUpdateWorkOrderPlanning,
  useDeleteWorkOrderPlanning,
} from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.hook";
import { DashboardStats } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/DashboardStats";
import { WorkerPerformanceChart } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/WorkerPerformanceChart";
import { StatusDistributionChart } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/StatusDistributionChart";
import { PlanningCalendar } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningCalendar";
import { planningColumns } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningColumns";
import { WorkOrderPlanningResource } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.interface";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORK_ORDER_PLANNING } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.constants";
import { Card } from "@/components/ui/card";
import PlanningTable from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningTable";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE, EMPRESA_AP } from "@/core/core.constants";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import PlanningOptions from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningOptions";
import { AssignedWorkDetail } from "@/features/ap/post-venta/taller/trabajos-asignados/components/AssignedWorkDetail";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { EditPlanningModal } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/EditPlanningModal";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";

export default function PlanningPage() {
  const navigate = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  //const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedPlanning, setSelectedPlanning] =
    useState<WorkOrderPlanningResource | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Estados para paginación y filtros
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [workerId, setWorkerId] = useState<string>("");

  // Estado persistente para sede
  const [sedeId, setSedeId] = useState<string>(() => {
    const stored = localStorage.getItem("planningPage_selectedSedeId");
    return stored || "";
  });

  const { data: mySedes = [], isLoading: isLoadingMySedes } = useMySedes({
    company: EMPRESA_AP.id,
  });

  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = WORK_ORDER_PLANNING;

  // Seleccionar la primera sede cuando se cargan las sedes y no hay una seleccionada
  useEffect(() => {
    if (mySedes.length > 0 && !sedeId) {
      const firstSedeId = mySedes[0].id.toString();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSedeId(firstSedeId);
      localStorage.setItem("planningPage_selectedSedeId", firstSedeId);
    }
  }, [mySedes, sedeId]);

  // Reiniciar página cuando cambian los filtros
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, per_page, workerId, sedeId]);

  // Obtener trabajadores para el filtro
  const { data: workers = [], isLoading: isLoadingWorkers } = useAllWorkers({
    cargo_id: POSITION_TYPE.OPERATORS,
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

  const { data, isLoading, refetch } = useGetWorkOrderPlanning({
    page,
    search,
    per_page,
    worker_id: workerId,
    ...(sedeId && { sede_id: sedeId }),
  });

  const updateMutation = useUpdateWorkOrderPlanning();
  const deleteMutation = useDeleteWorkOrderPlanning();

  const handleViewPlanning = (planning: WorkOrderPlanningResource) => {
    setSelectedPlanning(planning);
    setOpenDetailDialog(true);
  };

  const handleEditPlanning = (planning: WorkOrderPlanningResource) => {
    setSelectedPlanning(planning);
    setOpenEditDialog(true);
  };

  const handleDeletePlanning = (id: number) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
      setDeleteId(null);
    } catch {
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
    }
  };

  const handleUpdatePlanning = async (id: number, data: any) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      setOpenEditDialog(false);
      setSelectedPlanning(null);
    } catch (error: any) {
      const mjsError = error?.response?.data?.message || "Error desconocido";
      errorToast(mjsError);
    }
  };

  const handleOpenCreatePlanning = (date?: Date) => {
    const targetDate = date ?? new Date();
    localStorage.setItem("planningPage_selectedDate", targetDate.toISOString());
    navigate(`${ABSOLUTE_ROUTE}/agregar`);
  };

  const handleSedeChange = (value: string) => {
    setSedeId(value);
    localStorage.setItem("planningPage_selectedSedeId", value);
  };

  if (isLoadingModule || isLoadingMySedes) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  const plannings = data?.data || [];

  return (
    <div className="space-y-6">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle="Gestión de planificación de órdenes de trabajo con sesiones"
          icon={currentView.icon}
        />
        <div className="flex items-center gap-2 ml-auto">
          <SearchableSelect
            options={mySedes.map((item) => ({
              value: item.id.toString(),
              label: item.abreviatura,
            }))}
            value={sedeId}
            onChange={handleSedeChange}
            placeholder="Filtrar por sede"
            className="min-w-72"
            classNameOption="text-xs"
            allowClear={false}
          />
          <Button onClick={() => handleOpenCreatePlanning()}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Planificación
          </Button>
        </div>
      </HeaderTableWrapper>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Listado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardStats data={plannings} />
          <div className="grid gap-6 md:grid-cols-2">
            <WorkerPerformanceChart data={plannings} />
            <StatusDistributionChart data={plannings} />
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <PlanningCalendar
            data={plannings}
            onPlanningClick={handleViewPlanning}
            onNewPlanning={handleOpenCreatePlanning}
            sedeId={sedeId}
            onRefresh={refetch}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card className="p-6">
            <PlanningTable
              columns={planningColumns({
                onView: handleViewPlanning,
                onEdit: handleEditPlanning,
                onDelete: handleDeletePlanning,
                permissions: {
                  canEdit: true,
                  canDelete: true,
                },
              })}
              data={plannings}
              isLoading={isLoading || isLoadingWorkers}
            >
              <PlanningOptions
                search={search}
                setSearch={setSearch}
                workers={workers}
                workerId={workerId}
                setWorkerId={setWorkerId}
              />
            </PlanningTable>
          </Card>
          <DataTablePagination
            page={page}
            totalPages={data?.meta?.last_page || 1}
            onPageChange={setPage}
            per_page={per_page}
            setPerPage={setPerPage}
            totalData={data?.meta?.total || 0}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog para ver detalle y gestionar sesiones */}
      <AssignedWorkDetail
        planning={selectedPlanning}
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
      />

      {/* Modal de edición */}
      <EditPlanningModal
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        planning={selectedPlanning}
        onSubmit={handleUpdatePlanning}
        isSubmitting={updateMutation.isPending}
      />

      {/* Dialog de confirmación de eliminación */}
      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
