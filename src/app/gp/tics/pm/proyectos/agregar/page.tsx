"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";

import { SCRUM_PROJECT } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.constants";
import { storeScrumProject } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.actions";
import { ScrumProjectSchema } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.schema";
import { ScrumProjectForm } from "@/features/gp/tics/pm/scrumProject/components/ScrumProjectForm";

export default function AddScrumProjectPage() {
  const router = useNavigate();
  const { ABSOLUTE_ROUTE, EMPTY } = SCRUM_PROJECT;
  const { currentView, checkRouteExists, isLoadingModule } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeScrumProject,
    onSuccess: () => {
      successToast("Proyecto creado exitosamente");
      router(ABSOLUTE_ROUTE);
    },
    onError: () => errorToast("Hubo un error al crear el proyecto"),
  });

  const handleSubmit = (data: ScrumProjectSchema) => mutate(data);

  if (isLoadingModule) return null;
  if (!checkRouteExists("proyectos")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <ScrumProjectForm
        defaultValues={EMPTY!}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </FormWrapper>
  );
}
