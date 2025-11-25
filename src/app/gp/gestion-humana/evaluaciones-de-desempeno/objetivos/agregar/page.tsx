"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { storeObjective } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.actions";
import { ObjectiveSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.schema";
import { ObjectiveForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/components/ObjectiveForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { OBJECTIVE } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.constants";

export default function AddObjectivePage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ABSOLUTE_ROUTE } = OBJECTIVE;
  const { mutate, isPending } = useMutation({
    mutationFn: storeObjective,
    onSuccess: () => {
      successToast("Objetivo creado exitosamente");
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ?? "Hubo un error al crear el objetivo"
      );
    },
  });

  const handleSubmit = (data: ObjectiveSchema) => {
    mutate(data);
  };
  if (!checkRouteExists("objetivos")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <ObjectiveForm
        defaultValues={{
          name: "",
          description: "",
          metric_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
