"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  successToast,
} from "@/src/core/core.function";
import { ASSIGNMENT_LEADERSHIP } from "@/src/features/ap/configuraciones/ventas/asignar-jefe/lib/assignmentLeadership.constants";
import {
  findAssignmentLeadershipById,
  updateAssignmentLeadership,
} from "@/src/features/ap/configuraciones/ventas/asignar-jefe/lib/assignmentLeadership.actions";
import { AssignmentLeadershipResource } from "@/src/features/ap/configuraciones/ventas/asignar-jefe/lib/assignmentLeadership.interface";
import { AssignmentLeadershipSchema } from "@/src/features/ap/configuraciones/ventas/asignar-jefe/lib/assignmentLeadership.schema";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import FormWrapper from "@/src/shared/components/FormWrapper";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { AssignmentLeadershipForm } from "@/src/features/ap/configuraciones/ventas/asignar-jefe/components/AssignmentLeadershipForm";

export default function EditAssignmentLeadershipPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { QUERY_KEY, ROUTE, MODEL } = ASSIGNMENT_LEADERSHIP;

  const { data: AssignmentLeadership, isLoading: loadingAssignmentLeadership } =
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: () => findAssignmentLeadershipById(Number(id)),
      refetchOnWindowFocus: false,
    });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AssignmentLeadershipResource) =>
      updateAssignmentLeadership(Number(id), data),
    onSuccess: async () => {
      successToast("Asignación de asesores actualizada correctamente");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router.push("../");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: AssignmentLeadershipResource) => {
    mutate(data);
  };

  function mapAssignmentLeadershipToForm(
    data: AssignmentLeadershipResource
  ): Partial<AssignmentLeadershipSchema> {
    return {
      boss_id: data.boss_id.toString(),
      assigned_workers: data.assigned_workers.map((assigned_worker) => ({
        id: assigned_worker.id,
        name: assigned_worker.name,
      })),
    };
  }

  const isLoadingAny = loadingAssignmentLeadership || !AssignmentLeadership;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <AssignmentLeadershipForm
        defaultValues={mapAssignmentLeadershipToForm(AssignmentLeadership)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
