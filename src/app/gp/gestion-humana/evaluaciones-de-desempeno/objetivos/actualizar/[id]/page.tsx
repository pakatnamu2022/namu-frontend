"use client";

import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import {
  findObjectiveById,
  updateObjective,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.actions";
import { ObjectiveSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.schema";
import { ObjectiveResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.interface";
import { ObjectiveForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/components/ObjectiveForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from '@/app/not-found';


export default function UpdateObjectivePage() {
    const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: objective, isLoading: loadingObjective } = useQuery({
    queryKey: ["objective", id],
    queryFn: () => findObjectiveById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ObjectiveSchema) => updateObjective(id as string, data),
    onSuccess: async () => {
      successToast("Objetivo actualizada correctamente");
      await queryClient.invalidateQueries({
        queryKey: ["objective", id],
      });
      router("../");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message || "No se pudo actualizar la métrica"
      );
    },
  });

  const handleSubmit = (data: ObjectiveSchema) => {
    mutate({
      ...data,
    } as any);
  };

  function mapObjectiveToForm(
    data: ObjectiveResource
  ): Partial<ObjectiveSchema> {
    return {
      name: data.name,
      description: data.description || "",
      metric_id: data.metric_id.toString(),
    };
  }

  const isLoadingAny = loadingObjective || !objective;

  if (isLoadingAny) {
    return <div className="p-4 text-muted">Cargando métrica...</div>;
  }
  if (!checkRouteExists("objetivos")) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <ObjectiveForm
        defaultValues={mapObjectiveToForm(objective)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
