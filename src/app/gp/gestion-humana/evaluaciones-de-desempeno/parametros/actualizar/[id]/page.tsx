"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import {
  findParameterById,
  updateParameter,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.actions";
import {
  ParameterCreateSchema,
  ParameterSchema,
  ParameterUpdateSchema,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.schema";
import { ParameterResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.interface";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { PARAMETER } from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.constans";
import ParameterForm from "@/features/gp/gestionhumana/evaluaciondesempeño/parametros/components/ParameterForm";
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from "@/app/not-found";

const { MODEL } = PARAMETER;

export default function UpdateParameterPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: parameter, isLoading: loadingParameter } = useQuery({
    queryKey: [MODEL.name, id],
    queryFn: () => findParameterById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ParameterCreateSchema | ParameterUpdateSchema) =>
      updateParameter(id as string, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [MODEL.name, id],
      });
      router("../");
    },
    onError: () => {
      errorToast(ERROR_MESSAGE(MODEL, "update"));
    },
  });

  const handleSubmit = (
    data: ParameterCreateSchema | ParameterUpdateSchema
  ) => {
    mutate(data);
  };

  function mapParameterToForm(
    data: ParameterResource
  ): Partial<ParameterSchema> {
    return {
      name: data.name,
      type: data.type as "objectives" | "competences" | "final",
      detailsCount: data.details.length.toString() as "4" | "5" | "6",
      details: data.details.map((detail) => ({
        id: detail.id,
        label: detail.label,
        from: detail.from,
        to: detail.to,
      })),
    };
  }

  const isLoadingAny = loadingParameter || !parameter;

  if (isLoadingAny) {
    return <div className="p-4 text-muted">Cargando competencia...</div>;
  }
  if (!checkRouteExists("parametros")) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <ParameterForm
        defaultValues={mapParameterToForm(parameter)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
