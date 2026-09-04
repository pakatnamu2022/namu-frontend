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
import { notFound } from "@/shared/hooks/useNotFound";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { RECRUITMENT_PROCESS } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.constant";
import { storeRecruitmentProcess } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.actions";
import { RecruitmentProcessSchema } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.schema";
import { RecruitmentProcessForm } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/RecruitmentProcessForm";

export default function AddRecruitmentProcessPage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = RECRUITMENT_PROCESS;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeRecruitmentProcess,
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

  const handleSubmit = (data: RecruitmentProcessSchema) => {
    mutate({
      ...data,
      sede_id: Number(data.sede_id),
      area_id: Number(data.area_id),
      cargo_id: Number(data.cargo_id),
      cant_trab_solicita: Number(data.cant_trab_solicita),
    });
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
      <RecruitmentProcessForm
        defaultValues={{
          nombre_postulacion: "",
          cant_trab_solicita: 1,
          sede_id: "",
          area_id: "",
          cargo_id: "",
          fecha_inicio: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
