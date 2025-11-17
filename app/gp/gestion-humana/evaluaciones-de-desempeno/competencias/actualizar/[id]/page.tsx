"use client";

import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import {
  findCompetenceById,
  updateCompetence,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.actions";
import { CompetenceSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.schema";
import { CompetenceResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/lib/competence.interface";
import { CompetenceForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/competencias/components/CompetenceForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from '@/app/not-found';


export default function EditCompetencePage() {
    const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: competence, isLoading: loadingCompetence } = useQuery({
    queryKey: ["competence", id],
    queryFn: () => findCompetenceById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CompetenceSchema) =>
      updateCompetence(id as string, data),
    onSuccess: async () => {
      successToast("Competencia actualizada correctamente");
      await queryClient.invalidateQueries({
        queryKey: ["competence", id],
      });
      router("../");
    },
    onError: () => {
      errorToast("No se pudo actualizar la competencia");
    },
  });

  const handleSubmit = (data: CompetenceSchema) => {
    mutate(data);
  };

  function mapCompetenceToForm(
    data: CompetenceResource
  ): Partial<CompetenceSchema> {
    return {
      nombre: data.nombre,
      subCompetences: data.subcompetences?.map((sub) => ({
        id: sub.id,
        nombre: sub.nombre,
        definicion: sub.definicion ?? "",
        level1: sub.level1 ?? "",
        level2: sub.level2 ?? "",
        level3: sub.level3 ?? "",
        level4: sub.level4 ?? "",
        level5: sub.level5 ?? "",
      })),
    };
  }

  const isLoadingAny = loadingCompetence || !competence;

  if (isLoadingAny) {
    return <div className="p-4 text-muted">Cargando competencia...</div>;
  }
  if (!checkRouteExists("competencias")) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
       
      />
      <CompetenceForm
        defaultValues={mapCompetenceToForm(competence)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
