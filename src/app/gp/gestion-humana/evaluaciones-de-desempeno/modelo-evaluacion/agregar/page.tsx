"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { EvaluationModelForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/modelo-evaluacion/components/EvaluationModelForm";
import { useStoreEvaluationModel } from "@/features/gp/gestionhumana/evaluaciondesempeño/modelo-evaluacion/lib/evaluationModel.hook";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import type { EvaluationModelSchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/modelo-evaluacion/lib/evaluationModel.schema";

export default function AddEvaluationModelPage() {
  const { currentView, checkRouteExists } = useCurrentModule();
  const { mutate, isPending } = useStoreEvaluationModel();

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

  if (!checkRouteExists("modelo-evaluacion")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <EvaluationModelForm onSubmit={handleSubmit} isPending={isPending} />
    </FormWrapper>
  );
}
