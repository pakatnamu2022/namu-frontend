"use client";

import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { errorToast, successToast } from "@/core/core.function";
import GoalTravelActions from "@/features/tp/comercial/ControlMetas/components/GoalTravelActions";
import { goalTravelColumns } from "@/features/tp/comercial/ControlMetas/components/GoalTravelColumns";
import GoalTravelModal from "@/features/tp/comercial/ControlMetas/components/GoalTravelModal";
import GoalTravelOptions from "@/features/tp/comercial/ControlMetas/components/GoalTravelOptions";
import GoalTravelTable from "@/features/tp/comercial/ControlMetas/components/GoalTravelTable";
import { deleteGoalTravel } from "@/features/tp/comercial/ControlMetas/lib/GoalTravelControl.actions";
import { useGoalTravelControl } from "@/features/tp/comercial/ControlMetas/lib/GoalTravelControl.hook";
import DataTablePagination from "@/shared/components/DataTablePagination";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import TitleComponent from "@/shared/components/TitleComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, List, Trophy, AlertTriangle, BarChart3, AlertCircle, TrendingUp } from "lucide-react";
import RankingConductores from "@/features/tp/comercial/ControlMetas/components/RankingConductores";
import GoalTravelAlerts from "@/features/tp/comercial/ControlMetas/components/GoalTravelAlerts";
import DashboardGoalTravel from "@/features/tp/comercial/ControlMetas/components/DashboardGoalTravel";
import ComparativaMensual from "@/features/tp/comercial/ControlMetas/components/ComparativaMensual";
import ViajesNoFacturados from "@/features/tp/comercial/ControlMetas/components/ViajesNoFacturados";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import AnalisisEstrategico from "@/features/tp/comercial/ControlMetas/components/AnalisiEstrategico";
import { GuidedTour, TourStep } from '@/shared/components/GuidedTour';
export default function ControlGoalPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("all");
  const [useStatus, setUseStatus] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const permissions = useModulePermissions("control-metas");

  const TOUR_STEPS: TourStep[] = [
    {
      id: 'dashboard',
      target: '[data-tour="dashboard-tab"]',
      title: 'Panel de Control',
      description:
        'Visualiza el cumplimiento de metas con KPIs clave, gráficos de tendencia y el rendimiento general de tu flota.',
      position: 'bottom', // Se usará como preferencia, pero el sistema calculará la mejor posición
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'list',
      target: '[data-tour="list-tab"]',
      title: 'Lista de Metas',
      description:
        'Administra todas las metas de viaje. Puedes crear nuevas metas, editarlas o eliminarlas con filtros por período y estado.',
      position: 'bottom',
      icon: <List className="w-5 h-5" />,
    },
    {
      id: 'ranking',
      target: '[data-tour="ranking-tab"]',
      title: 'Ranking de Conductores',
      description:
        'Descubre quiénes son los conductores más destacados. El ranking muestra medallas, producción y viajes realizados.',
      position: 'bottom',
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: 'alerts',
      target: '[data-tour="alerts-tab"]',
      title: 'Alertas de Cumplimiento',
      description:
        'Identifica a conductores y vehículos que requieren atención. Actúa rápidamente para mejorar el rendimiento.',
      position: 'bottom',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      id: 'comparativa',
      target: '[data-tour="comparativa-tab"]',
      title: 'Comparativa Mensual',
      description:
        'Analiza la evolución del negocio comparando períodos. Visualiza viajes y producción por cliente.',
      position: 'bottom',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'no-facturados',
      target: '[data-tour="no-facturados-tab"]',
      title: 'Viajes No Facturados',
      description:
        'Controla los viajes pendientes de facturación. Mantén tus procesos contables al día.',
      position: 'bottom',
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      id: 'analisis',
      target: '[data-tour="analisis-tab"]',
      title: 'Análisis Estratégico',
      description:
        'Accede a información profunda sobre tendencias, proyecciones y distribución de producción para tomar mejores decisiones.',
      position: 'bottom', // Si no hay espacio abajo, se pondrá arriba automáticamente
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];
  useEffect(() => {
    setPage(1);
  }, [search, per_page, status, useStatus, year, month]);

  const params = {
    page,
    per_page,
    search,
    year: year || undefined,
    month: month || undefined,
    status_id: status === "all" ? undefined : status,
  };

  const { data, isLoading, refetch } = useGoalTravelControl(params);
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteGoalTravel(deleteId);
      await refetch();
      successToast("Meta eliminada correctamente. ");
    } catch (error) {
      errorToast("Error al eliminar la meta. ");
    } finally {
      setDeleteId(null);
    }
  };

  const handleUpdate = (id: number) => {
    setUpdateId(id);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };
  const handleCloseUpdateModal = () => {
    setUpdateId(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const availableYears = data?.available_years || [];

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("control-metas")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        {activeTab === "list" && <GoalTravelActions onCreate={handleCreate} />}
      </HeaderTableWrapper>

      {/* Tour guiado */}
      <GuidedTour
        tourKey="control-metas"
        steps={TOUR_STEPS}
        title="Bienvenido a Control de Metas"
        description="Te guiaremos por las principales funcionalidades para que aproveches al máximo esta herramienta."
        autoStart={true}
        allowSkip={true}
        onFinish={() => console.log('Tour completado')}
        onSkip={() => console.log('Tour saltado')}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="relative">
          <TabsTrigger value="dashboard" className="gap-2 transition-all duration-300" data-tour="dashboard-tab">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2 transition-all duration-300" data-tour="list-tab">
            <List className="h-4 w-4" />
            Lista de Metas
          </TabsTrigger>
          <TabsTrigger value="ranking" className="gap-2 transition-all duration-300" data-tour="ranking-tab">
            <Trophy className="h-4 w-4" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2 transition-all duration-300" data-tour="alerts-tab">
            <AlertTriangle className="h-4 w-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="comparativa" className="gap-2 transition-all duration-300" data-tour="comparativa-tab">
            <BarChart3 className="h-4 w-4" />
            Comparativa
          </TabsTrigger>
          <TabsTrigger value="no-facturados" className="gap-2 transition-all duration-300" data-tour="no-facturados-tab">
            <AlertCircle className="h-4 w-4" />
            No Facturados
          </TabsTrigger>
          <TabsTrigger value="analisis" className="gap-2 transition-all duration-300" data-tour="analisis-tab">
            <TrendingUp className="h-4 w-4" />
            Análisis Estratégico
          </TabsTrigger>

        </TabsList>

        {/*DASHBOARD */}
        <TabsContent value="dashboard" className="mt-0">
          <DashboardGoalTravel />
        </TabsContent>

        {/* LISTA DE METAS (Tu código actual) */}
        <TabsContent value="list" className="mt-0">
          <GoalTravelTable
            isLoading={isLoading}
            columns={goalTravelColumns({
              onDelete: setDeleteId,
              onUpdate: handleUpdate,
              permissions: permissions
            })}
            data={data?.data || []}
          >
            <GoalTravelOptions
              search={search}
              setSearch={setSearch}
              status={status}
              setStatus={setStatus}
              useStatus={useStatus}
              setUseStatus={setUseStatus}
              year={year}
              setYear={setYear}
              month={month}
              setMonth={setMonth}
              availableYears={availableYears}
            />
          </GoalTravelTable>

          <DataTablePagination
            page={page}
            totalPages={data?.meta?.last_page || 1}
            onPageChange={setPage}
            per_page={per_page}
            setPerPage={setPerPage}
            totalData={data?.meta?.total || 0}
          />
        </TabsContent>

        {/* RANKING */}
        <TabsContent value="ranking" className="mt-0">
          <RankingConductores />
        </TabsContent>

        {/* ALERTAS */}
        <TabsContent value="alerts" className="mt-0">
          <GoalTravelAlerts />
        </TabsContent>

        {/* COMPARATIVA */}
        <TabsContent value="comparativa" className="mt-0">
          <ComparativaMensual />
        </TabsContent>

        {/* NO FACTURADOS*/}
        <TabsContent value="no-facturados" className="mt-0">
          <ViajesNoFacturados />
        </TabsContent>

        {/* ANALISIS ESTRATEGICO */}
        <TabsContent value="analisis" className="mt-0">
          <AnalisisEstrategico />
        </TabsContent>
      </Tabs>

      <GoalTravelModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Nueva Meta"
        mode="create"
      />
      {updateId && (
        <GoalTravelModal
          id={updateId}
          open={!!updateId}
          onClose={handleCloseUpdateModal}
          title="Editar Meta"
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

      {/* <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      /> */}
    </div>
  );
}
