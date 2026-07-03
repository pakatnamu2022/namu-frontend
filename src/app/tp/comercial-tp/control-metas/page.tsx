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
import { LayoutDashboard, List, Trophy, AlertTriangle, BarChart3, AlertCircle } from "lucide-react";
import RankingConductores from "@/features/tp/comercial/ControlMetas/components/RankingConductores";
import GoalTravelAlerts from "@/features/tp/comercial/ControlMetas/components/GoalTravelAlerts";
import DashboardGoalTravel from "@/features/tp/comercial/ControlMetas/components/DashboardGoalTravel";
import ComparativaMensual from "@/features/tp/comercial/ControlMetas/components/ComparativaMensual";
import ViajesNoFacturados from "@/features/tp/comercial/ControlMetas/components/ViajesNoFacturados";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Lista de Metas
          </TabsTrigger>
          <TabsTrigger value="ranking" className="gap-2">
            <Trophy className="h-4 w-4" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="comparativa" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Comparativa
          </TabsTrigger>
          <TabsTrigger value="no-facturados" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            No Facturados
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
