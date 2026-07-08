"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  useCreateWorkOrderPlanning,
  useGetWorkOrderPlanning,
  useUpdateWorkOrderPlanning,
  useDeleteWorkOrderPlanning,
} from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.hook";
import { WorkerTimeline } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/WorkerTimeline";
import { WorkOrderPlanningResource } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.interface";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORK_ORDER_PLANNING } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.constants";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import { EditPlanningModal } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/EditPlanningModal";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";

export default function CreatePlanningPage() {
  const navigate = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [selectedPlanning, setSelectedPlanning] =
    useState<WorkOrderPlanningResource | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const selectedSedeId = localStorage.getItem("planningPage_selectedSedeId");

  const getInitialDate = (): Date => {
    const stored = localStorage.getItem("planningPage_selectedDate");
    if (stored) {
      const parsed = new Date(stored);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const parsedDay = new Date(parsed);
      parsedDay.setHours(0, 0, 0, 0);
      if (parsedDay >= today) return parsed;
    }
    return new Date();
  };

  const [selectedDate] = useState<Date>(getInitialDate);

  const { ROUTE, MODEL } = WORK_ORDER_PLANNING;
  const permissions = useModulePermissions(ROUTE);
  const { data, refetch } = useGetWorkOrderPlanning();
  const createMutation = useCreateWorkOrderPlanning();
  const updateMutation = useUpdateWorkOrderPlanning();
  const deleteMutation = useDeleteWorkOrderPlanning();

  const plannings = data?.data || [];

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
      await refetch();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    }
  };

  const handleUpdatePlanning = async (id: number, data: any) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      setOpenEditDialog(false);
      setSelectedPlanning(null);
      await refetch();
    } catch (error: any) {
      const mjsError = error?.response?.data?.message || "Error desconocido";
      errorToast(mjsError);
    }
  };

  const handleTimeSelect = async (
    startDatetime: Date,
    workerId: number,
    hours: number,
    workOrderId: number,
    description: string,
    groupNumber: number,
  ) => {
    try {
      // Formatear fecha/hora en formato local sin conversión a UTC
      const formatLocalDatetime = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const requestData = {
        work_order_id: workOrderId,
        worker_id: workerId,
        description: description,
        estimated_hours: hours,
        planned_start_datetime: formatLocalDatetime(startDatetime),
        group_number: groupNumber,
      };

      await createMutation.mutateAsync(requestData);
      successToast("Planificación creada exitosamente");

      // Refrescar datos para mostrar la nueva planificación en el timeline
      await refetch();
    } catch (error: any) {
      const mjsError = error?.response?.data?.message || "Error desconocido";
      errorToast(mjsError);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <HeaderTableWrapper>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <TitleComponent
            title="Nueva Planificación"
            subtitle="Selecciona la orden de trabajo, horario y descripciones para asignar el trabajo"
            icon={currentView.icon}
          />
        </div>
      </HeaderTableWrapper>

      <div className="w-full">
        <WorkerTimeline
          selectedDate={selectedDate}
          data={plannings}
          onEdit={handleEditPlanning}
          onDelete={handleDeletePlanning}
          permissions={permissions}
          selectionMode={true}
          estimatedHours={estimatedHours}
          onTimeSelect={handleTimeSelect}
          onEstimatedHoursChange={setEstimatedHours}
          fullPage={true}
          sedeId={selectedSedeId || undefined}
          onRefresh={refetch}
        />
      </div>

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
    </FormWrapper>
  );
}
