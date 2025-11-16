"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { errorToast, successToast } from "@/src/core/core.function";
import { AssignCompanyBranchResource } from "@/src/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.interface";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import {
  findAssignCompanyBranchById,
  updateAssignCompanyBranch,
} from "@/src/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.actions";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { ASSIGN_COMPANY_BRANCH } from "@/src/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.constants";
import { AssignCompanyBranchForm } from "@/src/features/ap/configuraciones/ventas/asignar-sede/components/AssignCompanyBranchForm";
import { AssignCompanyBranchSchema } from "@/src/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.schema";

export default function EditAssignCompanyBranchPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { QUERY_KEY, ROUTE } = ASSIGN_COMPANY_BRANCH;

  const { data: AssignCompanyBranch, isLoading: loadingAssignCompanyBranch } =
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: () => findAssignCompanyBranchById(Number(id)),
      refetchOnWindowFocus: false,
    });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AssignCompanyBranchResource) =>
      updateAssignCompanyBranch(Number(id), data),
    onSuccess: async () => {
      successToast("Asignación de asesores actualizada correctamente");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router.push("../");
    },
    onError: () => {
      errorToast("No se pudo actualizar la asignación de asesores");
    },
  });

  const handleSubmit = (data: AssignCompanyBranchResource) => {
    mutate(data);
  };

  function mapAssignCompanyBranchToForm(
    data: AssignCompanyBranchResource
  ): Partial<AssignCompanyBranchSchema> {
    return {
      sede_id: data.sede_id.toString(),
      assigned_workers: data.assigned_workers.map((assigned_worker) => ({
        id: assigned_worker.id,
        name: assigned_worker.name,
      })),
    };
  }

  const isLoadingAny = loadingAssignCompanyBranch || !AssignCompanyBranch;

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
      <AssignCompanyBranchForm
        defaultValues={mapAssignCompanyBranchToForm(AssignCompanyBranch)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
