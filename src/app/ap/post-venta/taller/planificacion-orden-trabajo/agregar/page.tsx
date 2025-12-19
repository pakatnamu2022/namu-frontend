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
} from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.hook";
import { WorkerTimeline } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/WorkerTimeline";
import { PlanningMiniForm } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/components/PlanningMiniForm";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORK_ORDER_PLANNING } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.constants";
import { successToast } from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";

export default function CreatePlanningPage() {
  const navigate = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    startDatetime: Date;
    workerId: number;
    hours: number;
  } | null>(null);
  const [showMiniForm, setShowMiniForm] = useState(false);

  const { ROUTE } = WORK_ORDER_PLANNING;
  const { data, refetch } = useGetWorkOrderPlanning();
  const createMutation = useCreateWorkOrderPlanning();

  // Obtener trabajadores
  const { data: workers = [] } = useAllWorkers({
    cargo_id: POSITION_TYPE.OPERATORS,
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

  const plannings = data?.data || [];

  const handleTimeSelect = (
    startDatetime: Date,
    workerId: number,
    hours: number
  ) => {
    setSelectedTimeSlot({ startDatetime, workerId, hours });
    setShowMiniForm(true);
  };

  const handleMiniFormSubmit = async (formData: any) => {
    if (!selectedTimeSlot) return;

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
        work_order_id: Number(formData.work_order_id),
        worker_id: selectedTimeSlot.workerId,
        description: formData.description,
        estimated_hours: selectedTimeSlot.hours,
        planned_start_datetime: formatLocalDatetime(
          selectedTimeSlot.startDatetime
        ),
      };

      await createMutation.mutateAsync(requestData);
      successToast("Planificación creada exitosamente");

      // Refrescar datos para mostrar la nueva planificación en el timeline
      await refetch();

      // Cerrar modal y limpiar selección
      setShowMiniForm(false);
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error("Error al crear planificación:", error);
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
            subtitle="Selecciona el horario disponible para asignar el trabajo"
            icon={currentView.icon}
          />
        </div>
      </HeaderTableWrapper>

      <div className="w-full">
        {/* Timeline ocupa 2/3 del espacio */}
        <div className="lg:col-span-2">
          <WorkerTimeline
            selectedDate={new Date()}
            data={plannings}
            selectionMode={true}
            estimatedHours={estimatedHours}
            onTimeSelect={handleTimeSelect}
            onEstimatedHoursChange={setEstimatedHours}
            fullPage={true}
          />
        </div>

        {/* Mini formulario ocupa 1/3 del espacio */}
        <div className="lg:col-span-1">
          <PlanningMiniForm
            open={showMiniForm}
            onOpenChange={setShowMiniForm}
            onSubmit={handleMiniFormSubmit}
            isLoading={createMutation.isPending}
            selectedWorkerName={
              selectedTimeSlot
                ? (() => {
                    const worker = workers.find(
                      (w) => w.id === selectedTimeSlot.workerId
                    );
                    return worker ? `${worker.name}` : undefined;
                  })()
                : undefined
            }
            selectedTime={
              selectedTimeSlot
                ? `${selectedTimeSlot.startDatetime.toLocaleTimeString(
                    "es-ES",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}`
                : undefined
            }
            estimatedHours={selectedTimeSlot?.hours}
          />
        </div>
      </div>
    </FormWrapper>
  );
}
