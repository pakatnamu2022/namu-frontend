"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
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
import { storeWorkSchedule } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.actions";
import { WorkScheduleForm } from "@/features/gp/gestionhumana/asistencias/horarios/components/WorkScheduleForm";
import type { WorkScheduleSchema } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.schema";

export default function AddWorkSchedulePage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = WORK_SCHEDULE;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: WorkScheduleSchema) =>
      storeWorkSchedule({
        name: data.name,
        checkin: data.checkin,
        lunch_out: data.lunch_out || null,
        lunch_in: data.lunch_in || null,
        checkout: data.checkout,
        details: data.details?.length ? data.details : undefined,
      }),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create"),
      );
    },
  });

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <WorkScheduleForm
        defaultValues={{ details: [] }}
        onSubmit={(data) => mutate(data)}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
