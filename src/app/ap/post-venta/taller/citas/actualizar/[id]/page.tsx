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
import { APPOINTMENT_PLANNING } from "@/features/ap/post-venta/taller/citas/lib/appointmentPlanning.constants";
import {
  findAppointmentPlanningById,
  updateAppointmentPlanning,
} from "@/features/ap/post-venta/taller/citas/lib/appointmentPlanning.actions";
import { AppointmentPlanningSchema } from "@/features/ap/post-venta/taller/citas/lib/appointmentPlanning.schema";
import { AppointmentPlanningResource } from "@/features/ap/post-venta/taller/citas/lib/appointmentPlanning.interface";
import { AppointmentPlanningForm } from "@/features/ap/post-venta/taller/citas/components/AppointmentPlanningForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function UpdateAppointmentPlanningPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = APPOINTMENT_PLANNING;

  const { data: appointmentPlanning, isLoading: loadingAppointmentPlanning } =
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: () => findAppointmentPlanningById(Number(id)),
      refetchOnWindowFocus: false,
    });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AppointmentPlanningSchema) =>
      updateAppointmentPlanning(Number(id), data),
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

  const handleSubmit = (data: AppointmentPlanningSchema) => {
    mutate(data);
  };

  function mapAppointmentPlanningToForm(
    data: AppointmentPlanningResource
  ): Partial<AppointmentPlanningSchema> {
    return {
      description: data.description,
      delivery_date: data.delivery_date,
      delivery_time: data.delivery_time,
      date_appointment: data.date_appointment,
      time_appointment: data.time_appointment,
      full_name_client: data.full_name_client,
      email_client: data.email_client,
      phone_client: data.phone_client,
      type_operation_appointment_id: data.type_operation_appointment_id,
      type_planning_id: data.type_planning_id,
      ap_vehicle_id: data.ap_vehicle_id,
    };
  }

  const isLoadingAny = loadingAppointmentPlanning || !appointmentPlanning;

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
      <AppointmentPlanningForm
        defaultValues={mapAppointmentPlanningToForm(appointmentPlanning)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
      />
    </FormWrapper>
  );
}
