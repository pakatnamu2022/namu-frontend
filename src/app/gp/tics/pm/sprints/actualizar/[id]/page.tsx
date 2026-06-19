"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";

import { SCRUM_SPRINT } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.constants";
import { updateScrumSprint } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.actions";
import { ScrumSprintSchema } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.schema";
import { ScrumSprintForm } from "@/features/gp/tics/pm/scrumSprint/components/ScrumSprintForm";
import { useScrumSprintById } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.hook";
import { useScrumProjects } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.hook";
import { ScrumSprintResource } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.interface";

function mapToForm(data: ScrumSprintResource): Partial<ScrumSprintSchema> {
  return {
    project_id: data.project_id.toString(),
    name: data.name,
    goal: data.goal ?? "",
    start_date: data.start_date ?? "",
    end_date: data.end_date ?? "",
    status: data.status,
  };
}

export default function UpdateScrumSprintPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { ABSOLUTE_ROUTE } = SCRUM_SPRINT;
  const { currentView, checkRouteExists, isLoadingModule } = useCurrentModule();

  const { data: sprint, isLoading } = useScrumSprintById(id ? Number(id) : null);
  const { data: projectsData } = useScrumProjects({ per_page: 100 });
  const projects = projectsData?.data ?? [];

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ScrumSprintSchema) =>
      updateScrumSprint(Number(id), { ...data, project_id: Number(data.project_id) }),
    onSuccess: async () => {
      successToast("Sprint actualizado correctamente");
      await queryClient.invalidateQueries({ queryKey: ["scrumSprint", Number(id)] });
      router(ABSOLUTE_ROUTE);
    },
    onError: () => errorToast("No se pudo actualizar el sprint"),
  });

  if (isLoading || isLoadingModule || !sprint) return <FormSkeleton />;
  if (!checkRouteExists("sprints")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="edit" icon={currentView.icon} />
      <ScrumSprintForm
        defaultValues={mapToForm(sprint)}
        onSubmit={mutate}
        isSubmitting={isPending}
        projects={projects}
      />
    </FormWrapper>
  );
}
