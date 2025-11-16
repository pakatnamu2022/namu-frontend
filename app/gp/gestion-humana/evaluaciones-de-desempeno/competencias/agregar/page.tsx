"use client";

import { useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { storeCompetence } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.actions";
import { CompetenceForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/components/CompetenceForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { CompetenceSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from '@/app/not-found';


export default function CreateCompetencePage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeCompetence,
    onSuccess: () => {
      successToast("Métrica creada exitosamente");
      router("./");
    },
    onError: () => {
      errorToast("Hubo un error al crear la métrica");
    },
  });

  const handleSubmit = (data: CompetenceSchema) => {
    mutate(data);
  };

  if (!checkRouteExists("competencias")) notFound();
  if (!currentView) return <NotFound />;

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
