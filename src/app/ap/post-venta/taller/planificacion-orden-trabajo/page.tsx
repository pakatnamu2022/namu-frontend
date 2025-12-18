"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState } from "react";
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
  useCreateWorkOrderPlanning,
} from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.hook";
import { DashboardStats } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/DashboardStats";
import { WorkerPerformanceChart } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/WorkerPerformanceChart";
import { StatusDistributionChart } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/StatusDistributionChart";
import { PlanningCalendar } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningCalendar";
import { PlanningTable } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningTable";
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

export default function PlanningPage() {
  const isTablet = useIsTablet();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedPlanning, setSelectedPlanning] =
    useState<WorkOrderPlanningResource | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const { ROUTE } = WORK_ORDER_PLANNING;

  const { data, isLoading, refetch } = useGetWorkOrderPlanning();
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
        <Button onClick={() => setOpenCreateDialog(true)}>
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
              isLoading={isLoading}
            />
          </Card>
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
