"use client";

import { useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { EvaluationModelForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/modelo-evaluacion/components/EvaluationModelForm";
import {
  useEvaluationModelById,
  useUpdateEvaluationModel,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/modelo-evaluacion/lib/evaluationModel.hook";
import FormWrapper from "@/shared/components/FormWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";
import type { EvaluationModelSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/modelo-evaluacion/lib/evaluationModel.schema";

export default function UpdateEvaluationModelPage() {
  const { id } = useParams();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: evaluationModel, isLoading } = useEvaluationModelById(
    Number(id)
  );
  const { mutate, isPending } = useUpdateEvaluationModel(id as string);

  const handleSubmit = (data: EvaluationModelSchema) => {
    // Transformar las categorías a array de IDs
    const payload = {
      leadership_weight: data.leadership_weight,
      self_weight: data.self_weight,
      par_weight: data.par_weight,
      report_weight: data.report_weight,
      categories: data.categories,
    };
    mutate(payload as any);
  };

  if (isLoading || !evaluationModel) {
    return <FormSkeleton />;
  }

  if (!checkRouteExists("modelo-evaluacion")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <EvaluationModelForm
        defaultValues={evaluationModel}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </FormWrapper>
  );
}
