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
import { notFound } from "@/shared/hooks/useNotFound";
import { WORK_ORDER_PLANNING } from "@/features/ap/post-venta/taller/planificacion-orden-trabajo/lib/workOrderPlanning.constants";
import { successToast } from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";

export default function CreatePlanningPage() {
  const navigate = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [estimatedHours, setEstimatedHours] = useState(2);
  const selectedSedeId = localStorage.getItem("planningPage_selectedSedeId");

  const { ROUTE } = WORK_ORDER_PLANNING;
  const { data, refetch } = useGetWorkOrderPlanning();
  const createMutation = useCreateWorkOrderPlanning();

  const plannings = data?.data || [];

  const handleTimeSelect = async (
    startDatetime: Date,
    workerId: number,
    hours: number,
    workOrderId: number,
    description: string,
    groupNumber: number
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
            subtitle="Selecciona la orden de trabajo, horario y descripciones para asignar el trabajo"
            icon={currentView.icon}
          />
        </div>
      </HeaderTableWrapper>

      <div className="w-full">
        <WorkerTimeline
          selectedDate={new Date()}
          data={plannings}
          selectionMode={true}
          estimatedHours={estimatedHours}
          onTimeSelect={handleTimeSelect}
          onEstimatedHoursChange={setEstimatedHours}
          fullPage={true}
          sedeId={selectedSedeId || undefined}
          onRefresh={refetch}
        />
      </div>
    </FormWrapper>
  );
}
