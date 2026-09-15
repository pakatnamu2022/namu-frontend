"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import FormWrapper from "@/shared/components/FormWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { CONTRACT_TEMPLATE } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/lib/contractTemplate.constant";
import {
  findContractTemplateById,
  updateContractTemplate,
} from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/lib/contractTemplate.actions";
import { ContractTemplateSchema } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/lib/contractTemplate.schema";
import { ContractTemplateResource } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/lib/contractTemplate.interface";
import { ContractTemplateForm } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/components/ContractTemplateForm";

export default function UpdateContractTemplatePage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = CONTRACT_TEMPLATE;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: contractTemplate, isLoading } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findContractTemplateById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ContractTemplateSchema) =>
      updateContractTemplate(id as string, data),
    onSuccess: async () => {
      successToast(`${MODEL.name} actualizada correctamente.`);
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ??
          `No se pudo actualizar la ${MODEL.name.toLowerCase()}.`,
      );
    },
  });

  function mapToForm(
    data: ContractTemplateResource,
  ): Partial<ContractTemplateSchema> {
    return {
      nombre: data.nombre,
      descripcion: data.descripcion ?? "",
      contenido: data.contenido,
    };
  }

  if (isLoading || !contractTemplate) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <ContractTemplateForm
        defaultValues={mapToForm(contractTemplate)}
        onSubmit={(data) => mutate(data)}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
