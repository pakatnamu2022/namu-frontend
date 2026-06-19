"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";

import { SCRUM_SPRINT } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.constants";
import { storeScrumSprint } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.actions";
import { ScrumSprintSchema } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.schema";
import { ScrumSprintForm } from "@/features/gp/tics/pm/scrumSprint/components/ScrumSprintForm";
import { useScrumProjects } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.hook";

export default function AddScrumSprintPage() {
  const router = useNavigate();
  const { ABSOLUTE_ROUTE, EMPTY } = SCRUM_SPRINT;
  const { currentView, checkRouteExists, isLoadingModule } = useCurrentModule();
  const { data: projectsData } = useScrumProjects({ per_page: 100 });
  const projects = projectsData?.data ?? [];

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ScrumSprintSchema) =>
      storeScrumSprint({ ...data, project_id: Number(data.project_id) }),
    onSuccess: () => {
      successToast("Sprint creado exitosamente");
      router(ABSOLUTE_ROUTE);
    },
    onError: () => errorToast("Hubo un error al crear el sprint"),
  });

  if (isLoadingModule) return null;
  if (!checkRouteExists("sprints")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="create" icon={currentView.icon} />
      <ScrumSprintForm
        defaultValues={{ ...EMPTY, project_id: EMPTY?.project_id?.toString() ?? "" }}
        onSubmit={mutate}
        isSubmitting={isPending}
        projects={projects}
      />
    </FormWrapper>
  );
}
