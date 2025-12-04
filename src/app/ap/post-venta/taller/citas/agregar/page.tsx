"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import { APPOINTMENT_PLANNING } from "@/features/ap/post-venta/taller/citas/lib/appointmentPlanning.constants";
import { storeAppointmentPlanning } from "@/features/ap/post-venta/taller/citas/lib/appointmentPlanning.actions";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { AppointmentPlanningForm } from "@/features/ap/post-venta/taller/citas/components/AppointmentPlanningForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddAppointmentPlanningPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = APPOINTMENT_PLANNING;

  const { mutate, isPending } = useMutation({
    mutationFn: storeAppointmentPlanning,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: any) => {
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
      <AppointmentPlanningForm
        defaultValues={{
          description: "",
          delivery_date: "",
          delivery_time: "",
          date_appointment: "",
          time_appointment: "",
          full_name_client: "",
          email_client: "",
          phone_client: "",
          type_operation_appointment_id: "",
          type_planning_id: "",
          ap_vehicle_id: "",
          advisor_id: "",
          sede_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
      />
    </FormWrapper>
  );
}
