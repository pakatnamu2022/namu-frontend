"use client";

import { notFound, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/src/core/core.function";
import { storeCompetence } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.actions";
import { CompetenceForm } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/competencias/components/CompetenceForm";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { CompetenceSchema } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.schema";
import FormWrapper from "@/src/shared/components/FormWrapper";

export default function CreateCompetencePage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeCompetence,
    onSuccess: () => {
      successToast("Métrica creada exitosamente");
      router.push("./");
    },
    onError: () => {
      errorToast("Hubo un error al crear la métrica");
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
