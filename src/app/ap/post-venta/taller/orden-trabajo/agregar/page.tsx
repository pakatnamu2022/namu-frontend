"use client";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import { WORKER_ORDER } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";
import { storeWorkOrder } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.actions";
import { WorkOrderSchema } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.schema";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { WorkOrderForm } from "@/features/ap/post-venta/taller/orden-trabajo/components/WorkOrderForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddWorkOrderPage() {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = WORKER_ORDER;

  const fromAppointment = searchParams.get("fromAppointment") === "true";

  const { mutate, isPending } = useMutation({
    mutationFn: storeWorkOrder,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: WorkOrderSchema) => {
    mutate(data);
  };

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <WorkOrderForm
        defaultValues={{
          appointment_planning_id: "",
          vehicle_id: "",
          sede_id: "",
          opening_date: new Date(),
          estimated_delivery_date: "",
          diagnosis_date: "",
          observations: "",
          has_appointment: fromAppointment,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
