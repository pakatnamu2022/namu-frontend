"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import FormWrapper from "@/shared/components/FormWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { CONTRACT_TYPE } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/lib/contractType.constant";
import {
  findContractTypeById,
  updateContractType,
} from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/lib/contractType.actions";
import { ContractTypeSchema } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/lib/contractType.schema";
import { ContractTypeResource } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/lib/contractType.interface";
import { ContractTypeForm } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/components/ContractTypeForm";

export default function UpdateContractTypePage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = CONTRACT_TYPE;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: contractType, isLoading } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findContractTypeById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ContractTypeSchema) =>
      updateContractType(id as string, {
        ...data,
        anios: data.anios === "" ? null : Number(data.anios),
        dias_vacaciones:
          data.dias_vacaciones === "" ? null : Number(data.dias_vacaciones),
      }),
    onSuccess: async () => {
      successToast(`${MODEL.name} actualizado correctamente.`);
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ??
          `No se pudo actualizar el ${MODEL.name.toLowerCase()}.`,
      );
    },
  });

  function mapToForm(
    data: ContractTypeResource,
  ): Partial<ContractTypeSchema> {
    return {
      descripcion: data.descripcion,
      anios: data.anios ?? "",
      dias_vacaciones: data.dias_vacaciones ?? "",
    };
  }

  if (isLoading || !contractType) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <ContractTypeForm
        defaultValues={mapToForm(contractType)}
        onSubmit={(data) => mutate(data)}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
