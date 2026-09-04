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
import { APPLICANT } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.constant";
import { storeApplicant } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.actions";
import { ApplicantSchema } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/lib/applicant.schema";
import { ApplicantForm } from "@/features/gp/gestionhumana/gestion-de-personal/postulantes/components/ApplicantForm";

export default function AddApplicantPage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = APPLICANT;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeApplicant,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
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
        defaultValues={{ proceso_postulacion_id: "", nombre_completo: "", vat: "" }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
