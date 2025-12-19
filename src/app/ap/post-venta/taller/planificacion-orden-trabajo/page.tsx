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
  useCreateWorkOrderPlanning,
  useGetWorkOrderPlanning,
} from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.hook";
import { DashboardStats } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/DashboardStats";
import { WorkerPerformanceChart } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/WorkerPerformanceChart";
import { StatusDistributionChart } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/StatusDistributionChart";
import { PlanningCalendar } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningCalendar";
import { planningColumns } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningColumns";
import { PlanningForm } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningForm";
import { PlanningDetail } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningDetail";
import { WorkOrderPlanningFormValues } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.schema";
import { WorkOrderPlanningResource } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.interface";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORK_ORDER_PLANNING } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.constants";
import { successToast } from "@/core/core.function";
import { Card } from "@/components/ui/card";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useIsTablet } from "@/hooks/use-mobile";
import PlanningTable from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningTable";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE, EMPRESA_AP } from "@/core/core.constants";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import PlanningOptions from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningOptions";

export default function PlanningPage() {
  const isTablet = useIsTablet();
  const navigate = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedPlanning, setSelectedPlanning] =
    useState<WorkOrderPlanningResource | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  // Estados para paginación y filtros
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [workerId, setWorkerId] = useState<string>("");

  const { ROUTE } = WORK_ORDER_PLANNING;

  // Reiniciar página cuando cambian los filtros
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, per_page, workerId]);

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
  });
  const createMutation = useCreateWorkOrderPlanning();

  const handleCreatePlanning = async (
    formData: WorkOrderPlanningFormValues
  ) => {
    try {
      const requestData = {
        work_order_id: Number(formData.work_order_id),
        worker_id: Number(formData.worker_id),
        description: formData.description,
        estimated_hours: Number(formData.estimated_hours),
      };

      await createMutation.mutateAsync(requestData);
      successToast("Planificación creada exitosamente");
      setOpenCreateDialog(false);
    } catch (error) {
      console.error("Error al crear planificación:", error);
    }
  };

  const handleViewPlanning = (planning: WorkOrderPlanningResource) => {
    setSelectedPlanning(planning);
    setOpenDetailDialog(true);
  };

  const handleStartSession = (notes?: string) => {
    if (!selectedPlanning) return;
    console.log("Iniciar sesión:", { planningId: selectedPlanning.id, notes });
    successToast("Sesión iniciada");
    refetch();
    setOpenDetailDialog(false);
  };

  const handlePauseWork = (reason?: string) => {
    if (!selectedPlanning) return;
    console.log("Pausar trabajo:", { planningId: selectedPlanning.id, reason });
    successToast("Trabajo pausado");
    refetch();
    setOpenDetailDialog(false);
  };

  const handleCompleteWork = () => {
    if (!selectedPlanning) return;
    console.log("Completar trabajo:", { planningId: selectedPlanning.id });
    successToast("Trabajo completado");
    refetch();
    setOpenDetailDialog(false);
  };

  const handleCancelPlanning = () => {
    if (!selectedPlanning) return;
    console.log("Cancelar planificación:", { planningId: selectedPlanning.id });
    successToast("Planificación cancelada");
    refetch();
    setOpenDetailDialog(false);
  };

  const handleOpenCreatePlanning = () => {
    navigate("/ap/post-venta/taller/planificacion-orden-trabajo/agregar");
  };

  if (isLoadingModule) return <PageSkeleton />;
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
        <Button onClick={handleOpenCreatePlanning}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Planificación
        </Button>
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
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card className="p-6">
            <PlanningTable
              columns={planningColumns({ onView: handleViewPlanning })}
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

      {/* Add GeneralSheet */}
      <GeneralSheet
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        title="Agregar Nuevo Trabajo"
        type={isTablet ? "tablet" : "default"}
        className="sm:max-w-2xl"
      >
        <PlanningForm
          onSubmit={handleCreatePlanning}
          isLoading={createMutation.isPending}
        />
      </GeneralSheet>

      {/* Dialog para ver detalle y gestionar sesiones */}
      <PlanningDetail
        planning={selectedPlanning}
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        onStart={handleStartSession}
        onPause={handlePauseWork}
        onComplete={handleCompleteWork}
        onCancel={handleCancelPlanning}
      />
    </div>
  );
}
