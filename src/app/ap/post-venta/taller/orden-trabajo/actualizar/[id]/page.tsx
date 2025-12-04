"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { WORKER_ORDER } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";
import {
  findWorkOrderById,
  updateWorkOrder,
} from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.actions";
import { WorkOrderSchema } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.schema";
import { WorkOrderResource } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.interface";
import { WorkOrderForm } from "@/features/ap/post-venta/taller/orden-trabajo/components/WorkOrderForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function UpdateWorkOrderPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = WORKER_ORDER;

  const { data: workOrder, isLoading: loadingWorkOrder } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findWorkOrderById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: WorkOrderSchema) => updateWorkOrder(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: WorkOrderSchema) => {
    mutate(data);
  };

  function mapWorkOrderToForm(
    data: WorkOrderResource
  ): Partial<WorkOrderSchema> {
    return {
      appointment_planning_id: data.appointment_planning_id
        ? String(data.appointment_planning_id)
        : "",
      vehicle_id: data.vehicle_id ? String(data.vehicle_id) : "",
      advisor_id: data.advisor_id ? String(data.advisor_id) : "",
      sede_id: data.sede_id ? String(data.sede_id) : "",
      opening_date: data.opening_date ? new Date(data.opening_date) : "",
      estimated_delivery_date: data.estimated_delivery_date
        ? new Date(data.estimated_delivery_date)
        : "",
      diagnosis_date: data.diagnosis_date ? new Date(data.diagnosis_date) : "",
      observations: data.observations || "",
    };
  }

  const isLoadingAny = loadingWorkOrder || !workOrder;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <WorkOrderForm
        defaultValues={mapWorkOrderToForm(workOrder)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
