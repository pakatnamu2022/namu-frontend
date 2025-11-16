"use client";

import { notFound, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/src/core/core.function";
import { storeObjective } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.actions";
import { ObjectiveSchema } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.schema";
import { ObjectiveForm } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/objetivos/components/ObjectiveForm";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormWrapper from "@/src/shared/components/FormWrapper";

export default function CreateObjectivePage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeObjective,
    onSuccess: () => {
      successToast("Objetivo creado exitosamente");
      router.push("./");
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
