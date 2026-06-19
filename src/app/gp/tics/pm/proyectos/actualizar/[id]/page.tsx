"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";

import { SCRUM_PROJECT } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.constants";
import { updateScrumProject } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.actions";
import { ScrumProjectSchema } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.schema";
import { ScrumProjectForm } from "@/features/gp/tics/pm/scrumProject/components/ScrumProjectForm";
import { useScrumProjectById } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.hook";
import { ScrumProjectResource } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.interface";

function mapToForm(data: ScrumProjectResource): Partial<ScrumProjectSchema> {
  return {
    name: data.name,
    description: data.description ?? "",
    color: data.color ?? "#3B82F6",
    status: data.status,
  };
}

export default function UpdateScrumProjectPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { ABSOLUTE_ROUTE } = SCRUM_PROJECT;
  const { currentView, checkRouteExists, isLoadingModule } = useCurrentModule();

  const { data: project, isLoading } = useScrumProjectById(id ? Number(id) : null);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ScrumProjectSchema) => updateScrumProject(Number(id), data),
    onSuccess: async () => {
      successToast("Proyecto actualizado correctamente");
      await queryClient.invalidateQueries({ queryKey: ["scrumProject", Number(id)] });
      router(ABSOLUTE_ROUTE);
    },
    onError: () => errorToast("No se pudo actualizar el proyecto"),
  });

  if (isLoading || isLoadingModule || !project) return <FormSkeleton />;
  if (!checkRouteExists("proyectos")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="edit" icon={currentView.icon} />
      <ScrumProjectForm defaultValues={mapToForm(project)} onSubmit={mutate} isSubmitting={isPending} />
    </FormWrapper>
  );
}
