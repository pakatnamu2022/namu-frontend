"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storeCompetence } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.actions";
import { CompetenceForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/components/CompetenceForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { CompetenceSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { COMPETENCE } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.constans";

export default function AddCompetencePage() {
  const { MODEL, ABSOLUTE_ROUTE } = COMPETENCE;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeCompetence,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create")
      );
    },
  });

  const handleSubmit = (data: CompetenceSchema) => {
    mutate(data);
  };

  if (!checkRouteExists("competencias")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <CompetenceForm
        defaultValues={{
          nombre: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
