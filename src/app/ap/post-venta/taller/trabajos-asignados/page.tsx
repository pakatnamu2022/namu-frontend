"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import { errorToast, successToast } from "@/core/core.function";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { DEFAULT_PER_PAGE, EMPRESA_AP } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import {
  useGetWorkOrderPlanning,
  usePauseWork,
  useStartSession,
} from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.hook";
import { WorkOrderPlanningResource } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.interface";
import { assignedWorkColumns } from "@/features/ap/post-venta/taller/trabajos-asignados/components/AssignedWorkColumns";
import AssignedWorkTable from "@/features/ap/post-venta/taller/trabajos-asignados/components/AssignedWorkTable";
import AssignedWorkOptions from "@/features/ap/post-venta/taller/trabajos-asignados/components/AssignedWorkOptions";
import { AssignedWorkDetail } from "@/features/ap/post-venta/taller/trabajos-asignados/components/AssignedWorkDetail";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useIsTablet } from "@/hooks/use-mobile";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  pauseWorkSchema,
  PauseWorkFormValues,
} from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.schema";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { WORK_ORDER_PLANNING_SESSION } from "@/features/ap/post-venta/taller/trabajos-asignados/lib/assignedWork.constants";

export default function AssignedWorkPage() {
  const isTablet = useIsTablet();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [workerId, setWorkerId] = useState<string>("");
  const [selectedWork, setSelectedWork] =
    useState<WorkOrderPlanningResource | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [actionWork, setActionWork] =
    useState<WorkOrderPlanningResource | null>(null);
  const [openPauseSheet, setOpenPauseSheet] = useState(false);
  const [openStartAlert, setOpenStartAlert] = useState(false);
  const [openCompleteAlert, setOpenCompleteAlert] = useState(false);
  const { ROUTE } = WORK_ORDER_PLANNING_SESSION;
  const startSession = useStartSession();
  const pauseWork = usePauseWork();

  const pauseForm = useForm<PauseWorkFormValues>({
    resolver: zodResolver(pauseWorkSchema),
    defaultValues: {
      pause_reason: "",
    },
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, per_page, workerId]);

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

  const handleViewWork = (work: WorkOrderPlanningResource) => {
    setSelectedWork(work);
    setOpenDetail(true);
  };
  const handleStartSession = (work: WorkOrderPlanningResource) => {
    setActionWork(work);
    setOpenStartAlert(true);
  };
  const handlePauseWork = (work: WorkOrderPlanningResource) => {
    setActionWork(work);
    setOpenPauseSheet(true);
  };
  const handleCompleteWork = (work: WorkOrderPlanningResource) => {
    setActionWork(work);
    setOpenCompleteAlert(true);
  };

  const handleStartConfirm = async () => {
    if (!actionWork) return;
    try {
      await startSession.mutateAsync({ id: actionWork.id });
      successToast("Sesión iniciada exitosamente");
      refetch();
      setOpenStartAlert(false);
      setActionWork(null);
    } catch (error: any) {
      errorToast("Error al iniciar la sesión", error.response?.data?.message);
    }
  };

  const handlePause = async (data: PauseWorkFormValues) => {
    if (!actionWork) return;
    try {
      await pauseWork.mutateAsync({
        id: actionWork.id,
        data: { pause_reason: data.pause_reason },
      });
      refetch();
      setOpenPauseSheet(false);
      pauseForm.reset();
      setActionWork(null);
    } catch (error: any) {
      errorToast("Error al pausar el trabajo", error.response?.data?.message);
      return;
    }
  };

  const handleCompleteConfirm = () => {
    if (!actionWork) return;
    console.log("Completar trabajo:", { workId: actionWork.id });
    successToast("Trabajo completado exitosamente");
    refetch();
    setOpenCompleteAlert(false);
    setActionWork(null);
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle="Gestiona tus trabajos asignados"
          icon={currentView.icon}
        />
      </HeaderTableWrapper>
      <AssignedWorkTable
        isLoading={isLoading || isLoadingWorkers}
        columns={assignedWorkColumns({
          onView: handleViewWork,
          onStart: handleStartSession,
          onPause: handlePauseWork,
          onComplete: handleCompleteWork,
        })}
        data={data?.data || []}
      >
        <AssignedWorkOptions
          search={search}
          setSearch={setSearch}
          workers={workers}
          workerId={workerId}
          setWorkerId={setWorkerId}
        />
      </AssignedWorkTable>
      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
      <AssignedWorkDetail
        planning={selectedWork}
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setSelectedWork(null);
        }}
      />

      {/* Alert para Iniciar */}
      <SimpleConfirmDialog
        open={openStartAlert}
        onOpenChange={setOpenStartAlert}
        onConfirm={handleStartConfirm}
        title="¿Iniciar trabajo?"
        description="¿Estás seguro de iniciar este trabajo? El estado cambiará a 'En Progreso'."
        confirmText="Sí, Iniciar"
        cancelText="No"
        variant="default"
        icon="success"
      />

      {/* Alert para Completar */}
      <SimpleConfirmDialog
        open={openCompleteAlert}
        onOpenChange={setOpenCompleteAlert}
        onConfirm={handleCompleteConfirm}
        title="¿Completar trabajo?"
        description="¿Estás seguro de marcar este trabajo como completado? Esta acción cambiará el estado a 'Completado'."
        confirmText="Sí, Completar"
        cancelText="No"
        variant="default"
        icon="success"
      />

      {/* Sheet para Pausar - Solo este requiere formulario */}
      {actionWork && (
        <GeneralSheet
          open={openPauseSheet}
          onClose={() => {
            setOpenPauseSheet(false);
            pauseForm.reset();
            setActionWork(null);
          }}
          title={`Pausar Trabajo - ${actionWork.work_order_correlative}`}
          type={isTablet ? "tablet" : "default"}
          className="sm:max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">{actionWork.description}</h3>
              <p className="text-sm text-muted-foreground">
                Orden: {actionWork.work_order_correlative}
              </p>
              <p className="text-sm text-muted-foreground">
                Horas trabajadas: {actionWork.actual_hours.toFixed(1)}h
                {actionWork.estimated_hours &&
                  ` / ${actionWork.estimated_hours}h estimadas`}
              </p>
            </div>
            <Form {...pauseForm}>
              <form
                onSubmit={pauseForm.handleSubmit(handlePause)}
                className="space-y-4"
              >
                <FormField
                  control={pauseForm.control}
                  name="pause_reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón de Pausa</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ej: Esperando repuesto del almacén..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpenPauseSheet(false);
                      pauseForm.reset();
                      setActionWork(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Pausar Trabajo
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </GeneralSheet>
      )}
    </div>
  );
}
