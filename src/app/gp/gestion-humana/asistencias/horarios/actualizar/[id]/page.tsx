"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORK_SCHEDULE } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.constants";
import { updateWorkSchedule } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.actions";
import { useWorkScheduleById } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.hook";
import { WorkScheduleForm } from "@/features/gp/gestionhumana/asistencias/horarios/components/WorkScheduleForm";
import type { WorkScheduleSchema } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.schema";
import type { WorkScheduleResource } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.interface";

function mapToForm(resource: WorkScheduleResource): Partial<WorkScheduleSchema> {
  return {
    name: resource.name,
    checkin: resource.checkin?.slice(0, 5) ?? "",
    lunch_out: resource.lunch_out?.slice(0, 5) ?? "",
    lunch_in: resource.lunch_in?.slice(0, 5) ?? "",
    checkout: resource.checkout?.slice(0, 5) ?? "",
    details: resource.details.map((d) => ({
      day_of_week: d.day_of_week,
      checkin: d.checkin?.slice(0, 5) ?? null,
      lunch_out: d.lunch_out?.slice(0, 5) ?? null,
      lunch_in: d.lunch_in?.slice(0, 5) ?? null,
      checkout: d.checkout?.slice(0, 5) ?? null,
    })),
  };
}

export default function UpdateWorkSchedulePage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = WORK_SCHEDULE;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: schedule, isLoading } = useWorkScheduleById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: WorkScheduleSchema) =>
      updateWorkSchedule(Number(id), {
        name: data.name,
        checkin: data.checkin,
        lunch_out: data.lunch_out || null,
        lunch_in: data.lunch_in || null,
        checkout: data.checkout,
        details: (data.details ?? []).map((d) => ({
          day_of_week: d.day_of_week,
          checkin: d.checkin ?? null,
          lunch_out: d.lunch_out ?? null,
          lunch_in: d.lunch_in ?? null,
          checkout: d.checkout ?? null,
        })),
      }),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "detail", Number(id)] });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "update"),
      );
    },
  });

  if (isLoading || !schedule) {
    return <div className="p-4 text-muted-foreground">Cargando horario...</div>;
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
      <WorkScheduleForm
        defaultValues={mapToForm(schedule)}
        onSubmit={(data) => mutate(data)}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
