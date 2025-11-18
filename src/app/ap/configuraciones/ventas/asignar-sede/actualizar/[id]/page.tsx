"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { errorToast, successToast } from "@/core/core.function";
import { AssignCompanyBranchResource } from "@/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.interface";
import FormSkeleton from "@/shared/components/FormSkeleton";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import {
  findAssignCompanyBranchById,
  updateAssignCompanyBranch,
} from "@/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.actions";
import FormWrapper from "@/shared/components/FormWrapper";
import { ASSIGN_COMPANY_BRANCH } from "@/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.constants";
import { AssignCompanyBranchForm } from "@/features/ap/configuraciones/ventas/asignar-sede/components/AssignCompanyBranchForm";
import { AssignCompanyBranchSchema } from "@/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.schema";
import NotFound from "@/app/not-found";

export default function EditAssignCompanyBranchPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { QUERY_KEY, ROUTE, ABSOLUTE_ROUTE } = ASSIGN_COMPANY_BRANCH;

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
      router(ABSOLUTE_ROUTE!);
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
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

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
