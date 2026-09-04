"use client";

import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { findRecruitmentProcessById } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.actions";
import { APPLICANT } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.constant";
import { storeApplicant } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.actions";
import { ApplicantSchema } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.schema";
import { ApplicantForm } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/ApplicantForm";

export default function AddApplicantPage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = APPLICANT;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const [searchParams] = useSearchParams();
  const procesoId = searchParams.get("proceso_id");

  const scopedRoute = procesoId
    ? `${RECRUITMENT_PROCESS.ABSOLUTE_ROUTE}/postulantes?proceso_id=${procesoId}`
    : ABSOLUTE_ROUTE;

  const { data: process } = useQuery({
    queryKey: [RECRUITMENT_PROCESS.QUERY_KEY, procesoId],
    queryFn: () => findRecruitmentProcessById(procesoId as string),
    enabled: !!procesoId,
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: storeApplicant,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(scopedRoute);
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create"));
    },
  });

  const handleSubmit = (data: ApplicantSchema) => {
    mutate({
      ...data,
      proceso_postulacion_id: Number(data.proceso_postulacion_id),
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
      <ApplicantForm
        defaultValues={{
          proceso_postulacion_id: procesoId ?? "",
          nombre_completo: "",
          vat: "",
        }}
        defaultProcessOption={
          process
            ? { value: String(process.id), label: process.nombre_postulacion }
            : undefined
        }
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        lockProcess={!!procesoId}
        cancelRoute={scopedRoute}
      />
    </FormWrapper>
  );
}
